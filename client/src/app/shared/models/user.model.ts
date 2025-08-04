export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: string;
  favArtists: string[];
  favGenres: string[];
  savedEvents?: string[];
  spotifyId?: string;
  artistPageID?: string;
}
