import mongoose, { Document, Schema } from 'mongoose';
import {
  INCIDENT_TYPES,
  IncidentType,
  INCIDENT_SEVERITY,
  IncidentSeverity,
  INCIDENT_STATUS,
  IncidentStatus,
} from '../constants';

export interface ILocation {
  latitude?: number;
  longitude?: number;
  section?: string;
  gate?: string;
  description?: string;
}

export interface IAiAnalysis {
  summary: string;
  protocol: string[];
  nextActions: string[];
  estimatedResolutionTime?: string;
  nearbyResources?: string[];
  generatedAt: Date;
}

export interface IIncident extends Document {
  _id: mongoose.Types.ObjectId;
  incidentId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  location: ILocation;
  aiAnalysis?: IAiAnalysis;
  timeline: Array<{
    action: string;
    performedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    notes?: string;
  }>;
  attachments?: string[];
  tags?: string[];
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    latitude: Number,
    longitude: Number,
    section: String,
    gate: String,
    description: String,
  },
  { _id: false }
);

const incidentSchema = new Schema<IIncident>(
  {
    incidentId: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(INCIDENT_TYPES),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(INCIDENT_SEVERITY),
      default: INCIDENT_SEVERITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(INCIDENT_STATUS),
      default: INCIDENT_STATUS.OPEN,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: locationSchema,
      default: {},
    },
    aiAnalysis: {
      summary: String,
      protocol: [String],
      nextActions: [String],
      estimatedResolutionTime: String,
      nearbyResources: [String],
      generatedAt: Date,
    },
    timeline: [
      {
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    attachments: [String],
    tags: [String],
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes — incidentId already unique via schema definition
incidentSchema.index({ type: 1, status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ 'location.section': 1 });

// Auto-generate incidentId
incidentSchema.pre('save', function (next) {
  if (!this.incidentId) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.incidentId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

export const Incident = mongoose.model<IIncident>('Incident', incidentSchema);
