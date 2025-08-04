import { Request, Response } from "express";
import { Artist, IArtist } from "../../models/artist";
import { Event, IEvent } from "../../models/event";
import { spotifyGetArtist, getRelatedArtist } from "../../utils";
import { getArtistPageEvents, deleteEventByID } from "../event/controller";
import { deletePhotoByName, deletePhotoByPath } from "../../middlewares/";
import {
  getTMArtist,
  getExternalEvents,
  getAbout,
} from "../../utils/ticketmasterApi";
import { User } from "../../models/users";
import { generateTokenAndSetCookie } from "../../middlewares/auth";
import { MyQuery } from "../search/controller";
import _ from "lodash";

const assetsPath = `/assets/`;

export const createArtistPage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userType = req.user!.type;

    if (userType === "User") {
      req.user.type = "Artist";
      generateTokenAndSetCookie(userId, "Artist", res);
      User.findByIdAndUpdate(userId, { type: "Artist" }).exec();
    }
    if (userType === "Artist") {
      const oldArtistPage = await Artist.findOne({ userID: userId });
      if (oldArtistPage)
        return res.status(401).json("you can only have one artist per user");
      generateTokenAndSetCookie(userId, "Artist", res);
      User.findByIdAndUpdate(userId, { type: "Artist" }).exec();
    }
    let artist = {
      name: req.body.name,
      profileImage: req.body.profileImage,
      genres: req.body.genres,
      about: req.body.about,
      externalLinks: {
        instagram: req.body.instagram || undefined,
        itunes: req.body.itunes || undefined,
        youtube: req.body.youtube || undefined,
      },
    };

    const newArtistPage = new Artist(artist);
    newArtistPage.userID = userId;

    if (req.file) {
      newArtistPage.profileImage = assetsPath + req.file.filename;
    }

    await newArtistPage.save();
    User.findByIdAndUpdate(userId, { artistPageID: newArtistPage.id }).exec();
    res.status(200).json(newArtistPage);
  } catch (error: any) {
    if (req.file) {
      deletePhotoByName(req.file.filename);
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateArtistPage = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const artistId = req.params.id;

  const deleteUploadedPhoto = () => {
    if (req.file) {
      deletePhotoByName(req.file.filename);
    }
  };

  try {
    const oldArtistPage = await Artist.findById(artistId);
    if (!oldArtistPage) {
      deleteUploadedPhoto();
      return res.status(404).json({ message: "Artist Page not found" });
    }

    if (userId !== oldArtistPage.userID && !(req.user!.type === "Admin")) {
      deleteUploadedPhoto();
      return res.status(403).json({ message: "You cannot edit others events" });
    }

    if (req.file) {
      if (oldArtistPage.profileImage) {
        deletePhotoByPath(oldArtistPage.profileImage as string);
      }
      oldArtistPage.profileImage = assetsPath + req.file.filename;
    }

    oldArtistPage.set(req.body);
    const updatedArtistPage = await oldArtistPage.save();
    res.status(200).json(updatedArtistPage);
  } catch (error: any) {
    deleteUploadedPhoto();
    res.status(500).json({ message: error.message });
  }
};

export const deleteArtistPage = async (req: Request, res: Response) => {
  try {
    let acceptedId;
    req.params.id ? (acceptedId = req.params.id) : (acceptedId = req.user!.id);
    const artist = await Artist.findByIdAndDelete(acceptedId);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (acceptedId !== artist.userID && !(req.user!.type === "Admin")) {
      return res
        .status(401)
        .json({ message: "You cannot delete others' profiles" });
    }
    if (artist.profileImage) {
      deletePhotoByPath(artist.profileImage);
    }
    const events = await Event.find({ artistID: artist.userID });
    if (events) {
      events.forEach((element) => {
        deleteEventByID(element._id);
      });
    }
    await User.findByIdAndUpdate(artist.userID, { type: "User" });
    res.status(200).json({ message: "Artist Page deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteArtistPageByID = async (id: string) => {
  try {
    const artist = await Artist.findByIdAndDelete(id);
    if (!artist) throw Error;
    if (artist.profileImage) {
      deletePhotoByPath(artist.profileImage);
    }
    const events = await Event.find({ artistPageID: id });

    if (events) {
      events.forEach((element) => {
        deleteEventByID(element._id);
      });
    }
    return true;
  } catch (error: any) {
    throw Error;
  }
};

const getTmData = async (artist: any) => {
  try {
    let events: IEvent[] = [];
    const tmArtist = await getTMArtist(artist.name);
    const tmID = tmArtist.id;
    events = await getExternalEvents(tmID);
    events = _.orderBy(events, ["dateTime"]); // sorting events by dateTime
    artist.tmID = tmID;

    if (tmArtist.externalLinks) {
      artist.externalLinks!.itunes = tmArtist.externalLinks.itunes?.[0].url;
      artist.externalLinks!.spotify = tmArtist.externalLinks.spotify?.[0].url;
      artist.externalLinks!.youtube = tmArtist.externalLinks.youtube?.[0].url;
      artist.externalLinks!.instagram =
        tmArtist.externalLinks.instagram?.[0].url;
    }
    return { artist: artist, events: events };
  } catch (error: any) {
    return { artist: artist, events: [] };
  }
};

export const getMyArtistPage = async (req: Request, res: Response) => {
  try {
    const id = req.user!.id;
    const myArtist = await Artist.findOne({ userID: id });
    if (!myArtist) {
      return res.status(404).json("aritst not found");
    }
    return res.status(200).json(myArtist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtistPage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (id.startsWith("bf_")) {
      let artist = await Artist.findById(id);
      artist!.visitCount = (artist!.visitCount as number) + 1;
      artist!.save();
      let events = await getArtistPageEvents(id);
      events = _.orderBy(events, ["dateTime"]); // sorting events by dateTime
      return res.status(200).json({ artist: artist, events: events });
    }

    let artist = await Artist.findOne({ spotifyID: req.params.id });
    if (artist) {
      if (artist.about == undefined || "") {
        const about = await getAbout(artist.name!);
        artist.about = about;
      }
      // Spotify API doesn't allow this function to be called anymore
      // if (artist.relatedArtists == undefined || []) {
      //   artist.relatedArtists = await getRelatedArtist(id);
      // }
      const data = await getTmData(artist);
      artist!.visitCount = (artist!.visitCount as number) + 1;
      artist.save();
      return res.status(200).json({ artist: data.artist, events: data.events });
    } else {
      const artist = await spotifyGetArtist(req.params.id);
      const about = await getAbout(artist.name!);
      artist.about = about;
      const data = await getTmData(artist);
      const newArtist = new Artist(artist);
      await newArtist.save();
      return res.status(200).json({ artist: newArtist, events: data.events });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchArtistPage = async (keyword: string) => {
  try {
    let query: any = {};
    const nameRegex = new RegExp(`^${keyword}`, "i");
    query.name = nameRegex;
    const artistPages = await Artist.find(query);
    return artistPages;
  } catch (error: any) {
    throw Error;
  }
};

export const searchArtistPageByGenre = async (keyword: string) => {
  try {
    let query: MyQuery = {};
    query.genres = [keyword];
    const artistPages = await Artist.find({
      genres: { $in: query.genres },
    }).exec();
    let artists: IArtist[] = [];
    if (artistPages) {
      artistPages.forEach((element: any) => {
        const artist: IArtist = {
          userID: element._id,
          name: element.name,
          profileImage: element.profileImage,
        };
        artists.push(artist);
      });
    }
    return artists;
  } catch (error: any) {
    return [];
  }
};
export const searchArtistPageByKeyword = async (keyword: string) => {
  try {
    const artistsRes = await Artist.find({
      name: keyword,
    }).exec();
    let artists: IArtist[] = [];
    if (artistsRes) {
      artistsRes.forEach((element: any) => {
        const artist: IArtist = {
          userID: element._id,
          name: element.name,
          profileImage: element.profileImage,
        };
        artists.push(artist);
      });
    }
    return artists;
  } catch (error: any) {
    return [];
  }
};

export const getHomepagePopularArtists = async () => {
  try {
    const mostViewedArtists: IArtist[] = await Artist.find({})
      .sort({ visitCount: -1 })
      .limit(20);
    if (!mostViewedArtists) {
      return [];
    }

    let artistsRes: IArtist[] = [];
    mostViewedArtists.forEach((element) => {
      const artist: IArtist = {
        _id: element.spotifyID ? element.spotifyID : element._id,
        name: element.name,
        profileImage: element.profileImage,
        visitCount: element.visitCount,
      };

      artistsRes.push(artist);
    });
    return artistsRes;
  } catch (error: any) {
    return [];
  }
};

export const getAllArtists = async (req: Request, res: Response) => {
  try {
    if (req.user!.type === "Admin") {
      const artists = await Artist.find({
        spotifyID: { $exists: false },
      });

      return res.status(200).json(artists);
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
