import mongoose, { Document, Schema } from 'mongoose';
import { INCIDENT_SEVERITY, IncidentSeverity } from '../constants';

export interface ISecurityAlert extends Document {
  _id: mongoose.Types.ObjectId;
  alertType: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: string;
  isActive: boolean;
  acknowledgedBy?: mongoose.Types.ObjectId[];
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  incidentRef?: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const securityAlertSchema = new Schema<ISecurityAlert>(
  {
    alertType: {
      type: String,
      required: true,
      enum: ['lost_person', 'suspicious_activity', 'unauthorized_access', 'crowd_threat', 'other'],
    },
    severity: {
      type: String,
      enum: Object.values(INCIDENT_SEVERITY),
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    location: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    acknowledgedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    incidentRef: { type: Schema.Types.ObjectId, ref: 'Incident' },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

securityAlertSchema.index({ isActive: 1, severity: 1 });
securityAlertSchema.index({ createdAt: -1 });

export const SecurityAlert = mongoose.model<ISecurityAlert>('SecurityAlert', securityAlertSchema);
