import mongoose, { Document, Schema } from 'mongoose';
import { AI_MODULE_TYPES } from '../constants';

export type AiModuleType = (typeof AI_MODULE_TYPES)[keyof typeof AI_MODULE_TYPES];

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface IAiChat extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  moduleType: AiModuleType;
  incidentRef?: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  summary?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const aiChatSchema = new Schema<IAiChat>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleType: {
      type: String,
      enum: Object.values(AI_MODULE_TYPES),
      required: true,
    },
    incidentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        audioUrl: String,
      },
    ],
    summary: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

aiChatSchema.index({ user: 1, moduleType: 1 });
aiChatSchema.index({ incidentRef: 1 });
aiChatSchema.index({ createdAt: -1 });

export const AiChat = mongoose.model<IAiChat>('AiChat', aiChatSchema);
