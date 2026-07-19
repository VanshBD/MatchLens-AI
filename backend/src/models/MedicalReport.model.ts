import mongoose, { Document, Schema } from 'mongoose';

export type MedicalEmergencyType =
  | 'cardiac_arrest'
  | 'seizure'
  | 'injury'
  | 'heat_stroke'
  | 'allergic_reaction'
  | 'breathing_difficulty'
  | 'unconscious'
  | 'other';

export interface IMedicalReport extends Document {
  _id: mongoose.Types.ObjectId;
  incidentRef: mongoose.Types.ObjectId;
  emergencyType: MedicalEmergencyType;
  patientDescription: string;
  patientAge?: number;
  patientGender?: string;
  location: string;
  section?: string;
  vitals?: {
    consciousness?: string;
    breathing?: string;
    pulse?: string;
    notes?: string;
  };
  firstAidGiven?: string;
  aiProtocol?: string[];
  nearestMedicalStation?: string;
  crowdDiversionPlan?: string;
  medicalStaffAssigned?: mongoose.Types.ObjectId[];
  transportationRequired: boolean;
  hospitalNotified: boolean;
  outcome?: string;
  reportedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const medicalReportSchema = new Schema<IMedicalReport>(
  {
    incidentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
    },
    emergencyType: {
      type: String,
      enum: [
        'cardiac_arrest',
        'seizure',
        'injury',
        'heat_stroke',
        'allergic_reaction',
        'breathing_difficulty',
        'unconscious',
        'other',
      ],
      required: true,
    },
    patientDescription: {
      type: String,
      required: true,
    },
    patientAge: Number,
    patientGender: String,
    location: {
      type: String,
      required: true,
    },
    section: String,
    vitals: {
      consciousness: String,
      breathing: String,
      pulse: String,
      notes: String,
    },
    firstAidGiven: String,
    aiProtocol: [String],
    nearestMedicalStation: String,
    crowdDiversionPlan: String,
    medicalStaffAssigned: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    transportationRequired: {
      type: Boolean,
      default: false,
    },
    hospitalNotified: {
      type: Boolean,
      default: false,
    },
    outcome: String,
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

medicalReportSchema.index({ incidentRef: 1 });
medicalReportSchema.index({ emergencyType: 1 });
medicalReportSchema.index({ createdAt: -1 });

export const MedicalReport = mongoose.model<IMedicalReport>('MedicalReport', medicalReportSchema);
