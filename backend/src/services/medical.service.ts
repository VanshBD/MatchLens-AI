import { geminiService } from '../ai/gemini.service';
import { MEDICAL_SYSTEM_PROMPT, MEDICAL_REPORT_SUMMARY_PROMPT } from '../prompts/medical.prompt';
import { MedicalReport } from '../models/MedicalReport.model';
import { Incident } from '../models/Incident.model';
import { INCIDENT_TYPES } from '../constants';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

export interface MedicalAiResponse {
  emergencyType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  immediateActions: string[];
  doNotDo: string[];
  nearestMedicalStation: string;
  crowdDiversionPlan: string;
  requiredEquipment: string[];
  protocol: string[];
  volunteerInstructions: string;
  escalationRequired: boolean;
  estimatedResponseTime: string;
  reportDraft: {
    patientCondition: string;
    actionsTaken: string;
    medicalTeamNotified: boolean;
  };
}

export interface CreateMedicalIncidentInput {
  description: string;
  location: string;
  section?: string;
  patientAge?: number;
  patientGender?: string;
  reportedBy: mongoose.Types.ObjectId;
}

class MedicalService {
  async analyzeEmergency(description: string): Promise<MedicalAiResponse> {
    return geminiService.generateStructured<MedicalAiResponse>(MEDICAL_SYSTEM_PROMPT, description);
  }

  async createIncident(input: CreateMedicalIncidentInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const aiAnalysis = await this.analyzeEmergency(input.description);

      const [incident] = await Incident.create(
        [
          {
            type: INCIDENT_TYPES.MEDICAL_EMERGENCY,
            severity: aiAnalysis.severity,
            title: `Medical Emergency - ${aiAnalysis.emergencyType} - ${input.location}`,
            description: input.description,
            reportedBy: input.reportedBy,
            location: { description: input.location, section: input.section },
            aiAnalysis: {
              summary: aiAnalysis.reportDraft.patientCondition,
              protocol: aiAnalysis.protocol,
              nextActions: aiAnalysis.immediateActions,
              nearbyResources: [aiAnalysis.nearestMedicalStation],
              generatedAt: new Date(),
            },
          },
        ],
        { session }
      );

      const [medicalReport] = await MedicalReport.create(
        [
          {
            incidentRef: incident._id,
            emergencyType: aiAnalysis.emergencyType as
              | 'cardiac_arrest'
              | 'seizure'
              | 'injury'
              | 'heat_stroke'
              | 'allergic_reaction'
              | 'breathing_difficulty'
              | 'unconscious'
              | 'other',
            patientDescription: input.description,
            patientAge: input.patientAge,
            patientGender: input.patientGender,
            location: input.location,
            section: input.section,
            aiProtocol: aiAnalysis.protocol,
            nearestMedicalStation: aiAnalysis.nearestMedicalStation,
            crowdDiversionPlan: aiAnalysis.crowdDiversionPlan,
            reportedBy: input.reportedBy,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      logger.info('Medical incident created', { incidentId: incident.incidentId });

      return { incident: medicalReport, aiAnalysis };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async generateReportSummary(reportData: string): Promise<string> {
    const prompt = MEDICAL_REPORT_SUMMARY_PROMPT(reportData);
    return geminiService.generateText(prompt);
  }

  async getActiveEmergencies(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      MedicalReport.find()
        .populate('reportedBy', 'name role')
        .populate('incidentRef', 'incidentId status severity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MedicalReport.countDocuments(),
    ]);
    return { data, total, page, limit };
  }
}

export const medicalService = new MedicalService();
