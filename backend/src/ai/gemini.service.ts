import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { env } from '../config/env';
import { logger } from '../config/logger';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private visionModel: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
    this.visionModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });
  }

  /**
   * Generate a structured JSON response from a prompt
   */
  async generateStructured<T>(systemPrompt: string, userMessage: string): Promise<T> {
    try {
      const fullPrompt = `${systemPrompt}\n\nUser Input: ${userMessage}\n\nRespond ONLY with valid JSON. No markdown, no code blocks, just raw JSON.`;
      const result = await this.model.generateContent(fullPrompt);
      const text = result.response.text().trim();

      // Strip markdown code fences if present
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      logger.error('Gemini structured generation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  /**
   * Generate a plain text response
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error('Gemini text generation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  /**
   * Start a multi-turn chat session
   */
  startChat(systemPrompt: string): ChatSession {
    return this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am ready to assist with stadium operations.' }],
        },
      ],
    });
  }

  /**
   * Send a message in an existing chat session
   */
  async sendChatMessage(chat: ChatSession, message: string): Promise<string> {
    try {
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      logger.error('Gemini chat error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  /**
   * Generate embedding for RAG
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({
        model: 'text-embedding-004',
      });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      logger.error('Gemini embedding error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Embedding service temporarily unavailable.');
    }
  }

  /**
   * Compute cosine similarity between two vectors
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const geminiService = new GeminiService();
