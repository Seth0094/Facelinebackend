import { Schema, model } from 'mongoose';
import { type IUserDocument } from '../interfaces';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Face from './Face';
import Like from './Like';
import Follow from './Follow';
import Block from './Block';

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/faceline-683f9.appspot.com/o?name=test%2F1709707492443.jpeg',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) next();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
  next();
});

UserSchema.pre('deleteOne', { document: true }, async function (next) {
  const userId = this._id;

  await Promise.all([
    Face.deleteMany({ userId }),
    Like.deleteMany({ userId }),
    Follow.deleteMany({ userId }),
    Follow.deleteMany({ followeeId: userId }),
    Block.deleteMany({ userId }),
    Block.deleteMany({ blockedId: userId }),
  ]);

  next();
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createToken = function (): string {
  return jwt.sign(
    { id: this._id, username: this.username },
    (process.env.JWT_SECRET as string) || 'secret',
  );
};

UserSchema.methods.toSafeObject = function (): object {
  const { _id, name, username, email, bio, avatar, createdAt } = this;

  return { _id, name, username, email, bio, avatar, createdAt };
};

export default model<IUserDocument>('User', UserSchema);
