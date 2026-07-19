import { geminiService } from '../ai/gemini.service';
import {
  LOST_CHILD_SYSTEM_PROMPT,
  LOST_CHILD_ANNOUNCEMENT_PROMPT,
} from '../prompts/lostChild.prompt';
import { LostChild, ILostChild } from '../models/LostChild.model';
import { Incident } from '../models/Incident.model';
import { INCIDENT_TYPES, SUPPORTED_LANGUAGES } from '../constants';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

export interface LostChildAiResponse {
  structuredInfo: {
    childName: string | null;
    estimatedAge: string;
    physicalDescription: string;
    lastSeenLocation: string;
    lastSeenTime: string;
    guardianDetails: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  severityReason: string;
  searchProtocol: string[];
  nearbyCheckpoints: string[];
  searchRadius: string;
  immediateActions: string[];
  announcementTemplate: string;
  incidentSummary: string;
  timeline: Array<{ time: string; action: string }>;
  escalationTriggers: string[];
}

export interface CreateLostChildInput {
  description: string;
  guardianName: string;
  guardianContact: string;
  lastSeenLocation: string;
  lastSeenTime?: Date;
  childName?: string;
  childAge?: number;
  photo?: string;
  reportedBy: mongoose.Types.ObjectId;
}

class LostChildService {
  /**
   * Analyze a lost child report using Gemini AI
   */
  async analyzeReport(description: string): Promise<LostChildAiResponse> {
    return geminiService.generateStructured<LostChildAiResponse>(
      LOST_CHILD_SYSTEM_PROMPT,
      description
    );
  }

  /**
   * Create a lost child incident with AI analysis
   */
  async createIncident(input: CreateLostChildInput): Promise<{
    incident: ILostChild;
    aiAnalysis: LostChildAiResponse;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Run AI analysis
      const aiAnalysis = await this.analyzeReport(input.description);

      // Create parent incident
      const [incident] = await Incident.create(
        [
          {
            type: INCIDENT_TYPES.LOST_CHILD,
            severity: aiAnalysis.severity,
            title: `Lost Child - ${input.childName || 'Unknown'} - ${input.lastSeenLocation}`,
            description: input.description,
            reportedBy: input.reportedBy,
            location: { description: input.lastSeenLocation },
            aiAnalysis: {
              summary: aiAnalysis.incidentSummary,
              protocol: aiAnalysis.searchProtocol,
              nextActions: aiAnalysis.immediateActions,
              nearbyResources: aiAnalysis.nearbyCheckpoints,
              generatedAt: new Date(),
            },
          },
        ],
        { session }
      );

      // Create lost child record
      const [lostChild] = await LostChild.create(
        [
          {
            incidentRef: incident._id,
            childName: input.childName,
            childAge: input.childAge,
            childDescription: input.description,
            lastSeenLocation: input.lastSeenLocation,
            lastSeenTime: input.lastSeenTime,
            guardianName: input.guardianName,
            guardianContact: input.guardianContact,
            photo: input.photo,
            aiSearchProtocol: aiAnalysis.searchProtocol,
            searchRadius: aiAnalysis.searchRadius,
            reportedBy: input.reportedBy,
            status: 'reported',
          },
        ],
        { session }
      );

      await session.commitTransaction();
      logger.info('Lost child incident created', { incidentId: incident.incidentId });

      return { incident: lostChild, aiAnalysis };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Generate multilingual announcements
   */
  async generateAnnouncements(
    childDescription: string,
    languages: string[] = Object.values(SUPPORTED_LANGUAGES)
  ): Promise<Record<string, string>> {
    const prompt = LOST_CHILD_ANNOUNCEMENT_PROMPT(childDescription, languages);
    const result = await geminiService.generateStructured<{
      announcements: Record<string, string>;
    }>('', prompt);
    return result.announcements;
  }

  /**
   * Get all active lost child cases
   */
  async getActiveCases(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      LostChild.find({ status: { $in: ['reported', 'searching'] } })
        .populate('reportedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LostChild.countDocuments({ status: { $in: ['reported', 'searching'] } }),
    ]);
    return { data, total, page, limit };
  }

  /**
   * Update case status
   */
  async updateStatus(id: string, status: ILostChild['status'], foundLocation?: string) {
    const update: Partial<ILostChild> = { status };
    if (status === 'found') {
      update.foundAt = new Date();
      update.foundLocation = foundLocation;
    }
    return LostChild.findByIdAndUpdate(id, update, { new: true });
  }
}

export const lostChildService = new LostChildService();
