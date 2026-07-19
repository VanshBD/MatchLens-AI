import { geminiService } from '../ai/gemini.service';
import { CROWD_SYSTEM_PROMPT } from '../prompts/crowd.prompt';
import { ACCESSIBILITY_SYSTEM_PROMPT } from '../prompts/accessibility.prompt';
import {
  TRANSLATION_SYSTEM_PROMPT,
  QUICK_TRANSLATION_PROMPT,
} from '../prompts/translation.prompt';
import { INCIDENT_SUMMARIZER_PROMPT } from '../prompts/summarizer.prompt';
import {
  KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT,
  RAG_CONTEXT_PROMPT,
} from '../prompts/knowledge.prompt';
import { KnowledgeBase } from '../models/KnowledgeBase.model';
import { AiChat } from '../models/AiChat.model';
import { AI_MODULE_TYPES } from '../constants';
import { retriever } from '../rag/retriever';
import { withCache } from '../config/redis';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

class AiService {
  /**
   * Crowd assistance analysis
   */
  async analyzeCrowd(description: string) {
    return geminiService.generateStructured(CROWD_SYSTEM_PROMPT, description);
  }

  /**
   * Accessibility route planning
   */
  async getAccessibilityAssistance(request: string) {
    return geminiService.generateStructured(ACCESSIBILITY_SYSTEM_PROMPT, request);
  }

  /**
   * Multi-language translation
   */
  async translateText(text: string, fromLang: string, toLang: string) {
    const prompt = QUICK_TRANSLATION_PROMPT(text, fromLang, toLang);
    return geminiService.generateStructured<{ translation: string; notes: string | null }>(
      '',
      prompt
    );
  }

  /**
   * Full multi-language translation (all supported languages)
   */
  async translateToAllLanguages(text: string) {
    return geminiService.generateStructured(TRANSLATION_SYSTEM_PROMPT, text);
  }

  /**
   * Summarize incident conversation
   */
  async summarizeIncident(conversation: string) {
    const prompt = INCIDENT_SUMMARIZER_PROMPT(conversation);
    return geminiService.generateStructured('', prompt);
  }

  /**
   * Knowledge base Q&A with RAG
   */
  async queryKnowledgeBase(question: string, userId: mongoose.Types.ObjectId) {
    // Use cache for repeated queries (5 min TTL)
    const cacheKey = `kb:${Buffer.from(question).toString('base64').slice(0, 40)}`;

    const response = await withCache(cacheKey, async () => {
      // Use RAG retriever
      const ragContext = await retriever.retrieve(question);

      if (ragContext.hasResults) {
        const prompt = RAG_CONTEXT_PROMPT(ragContext.contextText, question);
        return geminiService.generateStructured('', prompt);
      }
      return geminiService.generateStructured(KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT, question);
    }, 300); // cache 5 minutes

    // Save chat history (don't cache this)
    await this.saveChatMessage(userId, AI_MODULE_TYPES.KNOWLEDGE, question, JSON.stringify(response));
    return response;
  }

  /**
   * Retrieve relevant knowledge base documents (legacy text-based)
   */
  private async retrieveRelevantDocs(query: string, limit: number = 5) {
    return KnowledgeBase.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);
  }

  /**
   * Start or continue a chat session
   */
  async chat(
    userId: mongoose.Types.ObjectId,
    moduleType: string,
    message: string,
    chatId?: string
  ) {
    let existingChat = chatId
      ? await AiChat.findById(chatId)
      : null;

    const systemPrompt = this.getSystemPrompt(moduleType);
    let responseText: string;

    if (existingChat) {
      // Continue existing conversation - re-hydrate by replaying history
      const chatSession = geminiService.startChat(systemPrompt);
      responseText = await geminiService.sendChatMessage(chatSession, message);
    } else {
      // New conversation
      const chatSession = geminiService.startChat(systemPrompt);
      responseText = await geminiService.sendChatMessage(chatSession, message);
    }

    // Save to DB
    if (existingChat) {
      existingChat.messages.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: responseText, timestamp: new Date() }
      );
      await existingChat.save();
    } else {
      existingChat = await AiChat.create({
        user: userId,
        moduleType,
        messages: [
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: responseText, timestamp: new Date() },
        ],
      });
    }

    return { response: responseText, chatId: existingChat._id };
  }

  private getSystemPrompt(moduleType: string): string {
    const prompts: Record<string, string> = {
      [AI_MODULE_TYPES.LOST_CHILD]: 'You are a lost child emergency assistant for FIFA World Cup 2026.',
      [AI_MODULE_TYPES.MEDICAL]: 'You are a medical emergency support assistant for FIFA World Cup 2026.',
      [AI_MODULE_TYPES.CROWD]: 'You are a crowd management assistant for FIFA World Cup 2026.',
      [AI_MODULE_TYPES.ACCESSIBILITY]: 'You are an accessibility assistance guide for FIFA World Cup 2026.',
      [AI_MODULE_TYPES.TRANSLATION]: 'You are a multilingual translation assistant for FIFA World Cup 2026.',
      [AI_MODULE_TYPES.KNOWLEDGE]: KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT,
    };
    return prompts[moduleType] || 'You are a helpful stadium operations assistant for FIFA World Cup 2026.';
  }

  private async saveChatMessage(
    userId: mongoose.Types.ObjectId,
    moduleType: string,
    userMessage: string,
    aiResponse: string
  ) {
    try {
      await AiChat.create({
        user: userId,
        moduleType,
        messages: [
          { role: 'user', content: userMessage, timestamp: new Date() },
          { role: 'assistant', content: aiResponse, timestamp: new Date() },
        ],
      });
    } catch (error) {
      logger.warn('Failed to save chat message', { error });
    }
  }
}

export const aiService = new AiService();
