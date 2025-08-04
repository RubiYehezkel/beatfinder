import mongoose, { Schema } from "mongoose";

export interface IEvent {
  _id?: string;
  tmID?: string;
  userID?: string;
  artistID?: string;
  eventName?: string;
  genres?: string[];
  venue?: string;
  venueAddress?: string;
  city?: string;
  country?: string;
  url?: string;
  dateTime?: string | Date;
  modifiedDateTime?: Date;
  coverImage?: string;
  description?: string;
  visability?: boolean;
  accessibility?: string;
  parkingDetail?: string;
  generalInfo?: string;
  lineUp?: {
    name: string;
    image: string;
  }[];
  timezone?: string;
}

const eventSchema = new Schema<IEvent>({
  _id: { type: String, default: () => `bf_${new mongoose.Types.ObjectId()}` },
  tmID: { type: String, required: false },
  userID: { type: String, required: false },
  artistID: { type: String, required: false },
  eventName: { type: String, required: true },
  genres: { type: [String], required: true },
  venue: { type: String, required: true },
  venueAddress: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  url: { type: String, required: true },
  dateTime: { type: String, required: true },
  modifiedDateTime: { type: Date, required: false },
  coverImage: { type: String, required: false },
  timezone: { type: String, required: false },
  description: { type: String, required: false },
  visability: { type: String, required: false, default: true },
  accessibility: { type: String, required: false },
  parkingDetail: { type: String, required: false },
  generalInfo: { type: String, required: false },

  lineUp: {
    type: [
      {
        name: String,
        image: String,
      },
    ],
    required: false,
  },
});

export const Event = mongoose.model<IEvent>("Event", eventSchema);
