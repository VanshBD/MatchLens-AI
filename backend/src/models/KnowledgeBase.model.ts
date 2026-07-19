import mongoose, { Document, Schema } from 'mongoose';

export type KnowledgeCategory =
  | 'stadium_sop'
  | 'emergency_procedure'
  | 'volunteer_handbook'
  | 'accessibility_guide'
  | 'fifa_rules'
  | 'general';

export interface IKnowledgeBase extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  embedding?: number[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeBaseSchema = new Schema<IKnowledgeBase>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'stadium_sop',
        'emergency_procedure',
        'volunteer_handbook',
        'accessibility_guide',
        'fifa_rules',
        'general',
      ],
      required: true,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    embedding: {
      type: [Number],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

knowledgeBaseSchema.index({ category: 1, isActive: 1 });
knowledgeBaseSchema.index({ tags: 1 });
knowledgeBaseSchema.index({ title: 'text', content: 'text' });

export const KnowledgeBase = mongoose.model<IKnowledgeBase>('KnowledgeBase', knowledgeBaseSchema);
