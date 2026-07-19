/**
 * RAG (Retrieval-Augmented Generation) Retriever
 *
 * Retrieves relevant knowledge base documents for a given query.
 * Uses MongoDB full-text search as primary retrieval,
 * with cosine similarity re-ranking when embeddings are available.
 */

import { KnowledgeBase, IKnowledgeBase } from '../models/KnowledgeBase.model';
import { geminiService } from '../ai/gemini.service';
import { logger } from '../config/logger';

export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  score: number;
}

export interface RagContext {
  documents: RetrievedDocument[];
  contextText: string;
  hasResults: boolean;
}

class Retriever {
  private readonly TOP_K = 5;
  private readonly SIMILARITY_THRESHOLD = 0.65;

  /**
   * Retrieve relevant documents using text search
   */
  async retrieveByText(query: string, limit = this.TOP_K): Promise<RetrievedDocument[]> {
    try {
      const docs = await KnowledgeBase.find(
        { $text: { $search: query }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      return docs.map((doc) => ({
        id: (doc._id as unknown as string).toString(),
        title: doc.title,
        content: doc.content,
        category: doc.category,
        score: (doc as { score?: number }).score ?? 0,
      }));
    } catch (error) {
      logger.error('RAG text retrieval error', {
        error: error instanceof Error ? error.message : 'Unknown',
        query,
      });
      return [];
    }
  }

  /**
   * Retrieve relevant documents using semantic similarity (embeddings)
   * Falls back to text search if embedding fails
   */
  async retrieveSemantic(query: string, limit = this.TOP_K): Promise<RetrievedDocument[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await geminiService.generateEmbedding(query);

      // Get all documents with embeddings
      const docs = await KnowledgeBase.find(
        { isActive: true, embedding: { $exists: true } },
        { title: 1, content: 1, category: 1, embedding: 1 }
      ).lean();

      if (docs.length === 0) {
        // Fall back to text search
        return this.retrieveByText(query, limit);
      }

      // Compute cosine similarity for each document
      const scored = docs
        .map((doc) => ({
          id: (doc._id as unknown as string).toString(),
          title: doc.title,
          content: doc.content,
          category: doc.category,
          score: doc.embedding ? geminiService.cosineSimilarity(queryEmbedding, doc.embedding) : 0,
        }))
        .filter((d) => d.score >= this.SIMILARITY_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return scored.length > 0 ? scored : this.retrieveByText(query, limit);
    } catch (error) {
      logger.warn('Semantic retrieval failed, falling back to text search', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return this.retrieveByText(query, limit);
    }
  }

  /**
   * Build context string from retrieved documents
   */
  buildContext(documents: RetrievedDocument[]): string {
    if (documents.length === 0) return '';

    return documents
      .map((doc, i) => `[${i + 1}] ${doc.title} (${doc.category})\n${doc.content.slice(0, 1000)}`)
      .join('\n\n---\n\n');
  }

  /**
   * Full RAG retrieval pipeline — returns context ready for Gemini
   */
  async retrieve(query: string, useSemantic = false): Promise<RagContext> {
    const documents = useSemantic
      ? await this.retrieveSemantic(query)
      : await this.retrieveByText(query);

    const contextText = this.buildContext(documents);

    return {
      documents,
      contextText,
      hasResults: documents.length > 0,
    };
  }

  /**
   * Index a document by generating and storing its embedding
   */
  async indexDocument(docId: string): Promise<void> {
    try {
      const doc = await KnowledgeBase.findById(docId);
      if (!doc) throw new Error(`Document ${docId} not found`);

      const textToEmbed = `${doc.title} ${doc.content}`;
      const embedding = await geminiService.generateEmbedding(textToEmbed);

      await KnowledgeBase.findByIdAndUpdate(docId, { embedding });
      logger.info('Document indexed for semantic search', { docId, title: doc.title });
    } catch (error) {
      logger.error('Failed to index document', {
        docId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

export const retriever = new Retriever();
