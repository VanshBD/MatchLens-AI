import mongoose, { Document, Schema } from 'mongoose';

export type LostChildStatus = 'reported' | 'searching' | 'found' | 'closed';

export interface ILostChild extends Document {
  _id: mongoose.Types.ObjectId;
  incidentRef: mongoose.Types.ObjectId;
  childName?: string;
  childAge?: number;
  childDescription: string;
  lastSeenLocation: string;
  lastSeenTime?: Date;
  guardianName: string;
  guardianContact: string;
  guardianLocation?: string;
  physicalDescription: {
    height?: string;
    weight?: string;
    hairColor?: string;
    eyeColor?: string;
    clothing?: string;
    distinguishingFeatures?: string;
  };
  photo?: string;
  status: LostChildStatus;
  aiSearchProtocol?: string[];
  searchRadius?: string;
  multilingualAnnouncements?: Record<string, string>;
  assignedSecurityPersonnel?: mongoose.Types.ObjectId[];
  foundAt?: Date;
  foundLocation?: string;
  reportedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const lostChildSchema = new Schema<ILostChild>(
  {
    incidentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
    },
    childName: String,
    childAge: { type: Number, min: 0, max: 17 },
    childDescription: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    lastSeenLocation: {
      type: String,
      required: true,
    },
    lastSeenTime: Date,
    guardianName: {
      type: String,
      required: true,
    },
    guardianContact: {
      type: String,
      required: true,
    },
    guardianLocation: String,
    physicalDescription: {
      height: String,
      weight: String,
      hairColor: String,
      eyeColor: String,
      clothing: String,
      distinguishingFeatures: String,
    },
    photo: String,
    status: {
      type: String,
      enum: ['reported', 'searching', 'found', 'closed'],
      default: 'reported',
    },
    aiSearchProtocol: [String],
    searchRadius: String,
    multilingualAnnouncements: {
      type: Map,
      of: String,
    },
    assignedSecurityPersonnel: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    foundAt: Date,
    foundLocation: String,
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

lostChildSchema.index({ status: 1 });
lostChildSchema.index({ reportedBy: 1 });
lostChildSchema.index({ createdAt: -1 });

export const LostChild = mongoose.model<ILostChild>('LostChild', lostChildSchema);
