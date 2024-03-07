import type { Document, Types } from 'mongoose';

export interface Iface {
  content: string;
  image?: string;
  userId: Types.ObjectId;
  isReplyTo?: string | null;
  isEdited: boolean;
}

export interface IfaceDocument extends Iface, Document {}
