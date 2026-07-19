import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { lostChildService } from '../services/lostChild.service';
import { medicalService } from '../services/medical.service';
import { sendSuccess } from '../utils/response';
import mongoose from 'mongoose';

export class AiController {
  async analyzeLostChild(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description } = req.body;
      const analysis = await lostChildService.analyzeReport(description);
      sendSuccess(res, analysis, 'Lost child analysis complete');
    } catch (error) {
      next(error);
    }
  }

  async analyzeMedical(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description } = req.body;
      const analysis = await medicalService.analyzeEmergency(description);
      sendSuccess(res, analysis, 'Medical emergency analysis complete');
    } catch (error) {
      next(error);
    }
  }

  async analyzeCrowd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description } = req.body;
      const analysis = await aiService.analyzeCrowd(description);
      sendSuccess(res, analysis, 'Crowd analysis complete');
    } catch (error) {
      next(error);
    }
  }

  async accessibilityAssist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { request } = req.body;
      const assistance = await aiService.getAccessibilityAssistance(request);
      sendSuccess(res, assistance, 'Accessibility assistance generated');
    } catch (error) {
      next(error);
    }
  }

  async translate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, fromLang, toLang } = req.body;
      const result = await aiService.translateText(text, fromLang, toLang);
      sendSuccess(res, result, 'Translation complete');
    } catch (error) {
      next(error);
    }
  }

  async translateAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      const result = await aiService.translateToAllLanguages(text);
      sendSuccess(res, result, 'Multi-language translation complete');
    } catch (error) {
      next(error);
    }
  }

  async summarizeIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conversation } = req.body;
      const summary = await aiService.summarizeIncident(conversation);
      sendSuccess(res, summary, 'Incident summarized');
    } catch (error) {
      next(error);
    }
  }

  async queryKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question } = req.body;
      const result = await aiService.queryKnowledgeBase(
        question,
        new mongoose.Types.ObjectId(req.user!.userId)
      );
      sendSuccess(res, result, 'Knowledge query complete');
    } catch (error) {
      next(error);
    }
  }

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, moduleType, chatId } = req.body;
      const result = await aiService.chat(
        new mongoose.Types.ObjectId(req.user!.userId),
        moduleType,
        message,
        chatId
      );
      sendSuccess(res, result, 'AI response generated');
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
