import type { Document, Types } from 'mongoose';

export interface ILike {
  userId: Types.ObjectId;
  faceId: Types.ObjectId;
}

export interface ILikeDocument extends ILike, Document {}
