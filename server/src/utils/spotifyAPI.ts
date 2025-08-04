import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { IArtist } from "../models/artist";
import { Error } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "app-remote-control",
  "streaming",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-follow-modify",
  "user-follow-read",
  "user-read-playback-position",
  "user-top-read",
  "user-read-recently-played",
  "user-library-modify",
  "user-library-read",
  "user-read-email",
  "user-read-private",
];

const secret = process.env.SPOTIFY_SECRET_KEY || "SECRET_KEY";
const clientId = process.env.SPOTIFY_CLIENT_ID || "SPOTIFY_CLIENT_ID";

const sdk = SpotifyApi.withClientCredentials(clientId, secret, scopes);

export const spotifySearchArtist = async (
  keyword: string,
  limit: 5 | 10 | 20 = 5
) => {
  try {
    if (!keyword) {
      throw Error;
    }
    let artists: IArtist[] = [];
    const spotifyResponse = await sdk.search(
      keyword,
      ["artist"],
      undefined,
      limit
    );
    if (spotifyResponse.artists) {
      spotifyResponse.artists.items.forEach((element: any) => {
        const artist: IArtist = {
          spotifyID: element.id,
          name: element.name,
          profileImage: element.images[1]?.url || "No Image",
        };
        artists.push(artist);
      });
    }
    return artists;
  } catch (error: any) {
    throw Error;
  }
};

export const spotifySearchArtistByGenre = async (
  query: string,
  limit: 5 | 10 | 20 = 5
) => {
  try {
    if (!query) {
      throw Error;
    }

    let artists: IArtist[] = [];
    const spotifyResponse = await sdk.search(
      query,
      ["artist"],
      undefined,
      limit
    );

    if (!spotifyResponse) {
      return [];
    }
    if (spotifyResponse.artists) {
      spotifyResponse.artists.items.forEach((element: any) => {
        if (element.genres.length > 0) {
          const artist: IArtist = {
            spotifyID: element.id,
            name: element.name,
            profileImage: element.images[1]?.url || "No Image",
          };
          artists.push(artist);
        }
      });
    }
    return artists;
  } catch (error: any) {
    return [];
  }
};

export const getRelatedArtist = async (id: string) => {
  try {
    let relatedArtistsArray: any = []
    const relatedArtists = await sdk.artists.relatedArtists(id);
    relatedArtists.artists.forEach((element) => {
      relatedArtistsArray.push({
        name: element.name,
        profileImage:
          element.images.length > 0
            ? element.images[0].url
            : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        spotifyId: element.id,
      });
    });
    return relatedArtistsArray
  }catch (error: any) {
    return []
  }
};
    

export const spotifyGetArtist = async (id: string) => {
  try {
    if (!id) {
      throw Error;
    }
    const spotifyResponse = await sdk.artists.get(id);

    //const relatedArtists = await sdk.artists.relatedArtists(id);
    let artist: IArtist = {
      spotifyID: id,
      name: spotifyResponse.name,
      genres: spotifyResponse.genres ? spotifyResponse.genres : [],
      profileImage:
        spotifyResponse.images.length > 0
          ? spotifyResponse.images[0].url
          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      relatedArtists: [],
      about: "",
      externalLinks: {
        youtube: undefined,
        itunes: undefined,
        spotify: undefined,
        instagram: undefined
      }
    };
    // relatedArtists.artists.forEach((element) => {
    //   artist.relatedArtists?.push({
    //     name: element.name,
    //     profileImage:
    //       element.images.length > 0
    //         ? element.images[0].url
    //         : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    //     spotifyId: element.id,
    //   });
    // });

    return artist;
  } catch (error: any) {
    throw Error;
  }
};

export function handleSpotifyQuery(input: string): string {
  return input.split(" ").join("%20");
}

export const getSpotifyArtistByName = async (name: string) => {
  try {
    const spotifyResponse = await sdk.search(
      name,
      ["artist"],
      undefined,
      1
    );
    console.log(spotifyResponse.artists.items);
    
  }
  
  catch (error: any) {
    throw Error;
  }

}
