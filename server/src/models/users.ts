import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: string;
  favArtists: string[];
  favGenres: string[];
  savedEvents: string[];
  spotifyId?: string;
  artistPageID?: string;
}

interface IUserDocument extends IUser, Document {
  isModified(field: string): boolean;
}

const userSchema = new Schema<IUser>({
  _id: { type: String, default: () => `bf_${new mongoose.Types.ObjectId()}` },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  favArtists: { type: [String], required: false, select: true },
  savedEvents: { type: [String], required: false, select: true },
  favGenres: { type: [String], required: false, select: true },
  type: {
    type: String,
    required: true,
    default: "User",
    enum: ["Admin", "User", "Artist"],
  },
  spotifyId: { type: [], required: false, select: true },
  artistPageID: { type: String, required: false },
});

userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
