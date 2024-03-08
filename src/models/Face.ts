import { Schema, model } from 'mongoose';
import { type IfaceDocument } from '../interfaces';

const FaceSchema = new Schema<IfaceDocument>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    image: {
      type: [String],
      trim: true,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isReplyTo: {
      type: Schema.Types.ObjectId,
      ref: 'face',
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// On face deleteone or delete many, delete all replies
FaceSchema.pre('deleteOne', { document: true }, async function () {
  await this.model('face').deleteMany({ isReplyTo: this._id });
});

export default model<IfaceDocument>('face', FaceSchema);
