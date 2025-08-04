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
