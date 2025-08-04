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
