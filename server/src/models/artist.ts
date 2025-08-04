import mongoose, { Schema } from "mongoose";

export interface IArtist {
  _id?: string;
  userID?: string;
  name?: string;
  about?: string;
  profileImage?: string;
  genres?: string[];
  relatedArtists?: {
    name: string;
    profileImage: string;
    spotifyId: string;
  }[];
  spotifyID?: string;
  tmID?: string;
  externalLinks?: {
    youtube?: string;
    itunes?: string;
    spotify?: string;
    instagram?: string;
  };
  visitCount?: number;
}

const artistSchema = new Schema<IArtist>({
  _id: { type: String, default: () => `bf_${new mongoose.Types.ObjectId()}` },
  userID: { type: String, required: false },
  name: { type: String, required: true },
  about: { type: String, required: false },
  profileImage: { type: String, required: true },
  genres: { type: [String], required: true },
  relatedArtists: {
    type: [
      {
        name: String,
        profileImage: String,
        spotifyId: String,
      },
    ],
    required: false,
  },
  spotifyID: { type: String, required: false },
  tmID: { type: String, required: false },
  externalLinks: {
    type: {
      youtube: String,
      itunes: String,
      spotify: String,
      instagram: String,
    },
    required: false,
  },
  visitCount: { type: Number, required: true, default: 1 },
});

export const Artist = mongoose.model<IArtist>("Artist", artistSchema);
