import { Request, Response } from "express";
import { User } from "../../models/users";
import { Artist, IArtist } from "../../models/artist";
import { Event } from "../../models/event";
import { generateTokenAndSetCookie, logout } from "../../middlewares/auth";
import { deleteArtistPageByID } from "../artist/controller";
import { saveEvent } from "../event/controller";

import { AccessToken } from "@spotify/web-api-ts-sdk";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { times } from "lodash";
import _ from "lodash";
import { all } from "axios";

const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
dotenv.config();

export const updateUser = async (req: Request, res: Response) => {
  try {
    let acceptedId;
    req.params.id ? (acceptedId = req.params.id) : (acceptedId = req.user!.id);
    const potentialUser = await User.findById(req.params.id);
    if (!potentialUser)
      return res.status(404).json({ message: "User not found" });
    if (acceptedId != potentialUser._id && req.user!.type != "Admin")
      return res.status(401).json({ message: "cannot edit other users" });

    const updatedUser = await User.findByIdAndUpdate(acceptedId, req.body);
    console.log(acceptedId, updatedUser);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong current password" });
    }

    if (req.body.newPassword && isMatch) {
      const salt = await bcrypt.genSalt(10);
      const cryptedPassword = await bcrypt.hash(req.body.newPassword, salt);
      const newUser = await User.updateOne(
        { _id: req.user!.id },
        { password: cryptedPassword }
      );
      return res
        .status(200)
        .json({ message: "Password has changed successfully" });
    }
    return res.status(404).json({ message: "No password provided" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedEvents = async (id: string) => {
  try {
    const user = await User.findById(id);
    const eventsId = user?.savedEvents || [];

    if (eventsId.length === 0) {
      return [];
    }
    const [tmEvents, bfEvents] = await Promise.all([
      Event.find({ tmID: { $in: eventsId } }),
      Event.find({ _id: { $in: eventsId } }),
    ]);

    const miniTmEvents = tmEvents.map((event) => ({
      eventName: event.eventName,
      venueAddress: event.venueAddress,
      coverImage: event.coverImage,
      dateTime: event.dateTime,
      id: event.tmID,
    }));
    const miniBfEvents = bfEvents.map((event) => ({
      eventName: event.eventName,
      venueAddress: event.venueAddress,
      coverImage: event.coverImage,
      dateTime: event.dateTime,
      id: event._id,
    }));

    let miniEvents = [...miniBfEvents, ...miniTmEvents];
    miniEvents = _.orderBy(miniEvents, ["dateTime"]);
    return miniEvents;
  } catch (error: any) {
    return [];
  }
};

export const getFollowdArtists = async (id: string) => {
  try {
    const user = await User.findById(id);
    const artistsId = user?.favArtists || [];

    if (artistsId.length === 0) {
      return [];
    }
    const [spotifyArtsts, bfArtists] = await Promise.all([
      Artist.find({ spotifyID: { $in: artistsId } }),
      Artist.find({ _id: { $in: artistsId } }),
    ]);

    const miniSpotifyArtsts = spotifyArtsts.map((artist) => ({
      artistName: artist.name,
      profileImage: artist.profileImage,
      id: artist.spotifyID,
    }));
    const miniBfArtists = bfArtists.map((artist) => ({
      artistName: artist.name,
      profileImage: artist.profileImage,
      id: artist._id,
    }));

    return [...miniSpotifyArtsts, ...miniBfArtists];
  } catch (error: any) {
    return [];
  }
};

export const getSavedData = async (req: Request, res: Response) => {
  const id = req.user!.id;
  const [events, artists] = await Promise.all([
    getSavedEvents(id),
    getFollowdArtists(id),
  ]);
  res.status(200).json({ events: events, artists: artists });
};

export const attendEvent = async (req: Request, res: Response) => {
  try {
    const userID = req.user!.id;
    const user = await User.findById(userID);
    const eventID = req.body.eventId;

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.savedEvents.includes(eventID)) {
      user.savedEvents = user.savedEvents.filter((id) => id !== eventID);
      await user.save();
      return res.status(200).json({ message: "Event removed" });
    }
    user.savedEvents.push(eventID);
    user.save();
    saveEvent(eventID);
    res.status(200).json({ message: "Saved event" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const followArtist = async (req: Request, res: Response) => {
  try {
    const userID = req.user!.id;
    const user = await User.findById(userID);
    const artistID = req.body.artistId;
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.favArtists.includes(artistID)) {
      user.favArtists = user.favArtists.filter((id) => id !== artistID);
      await user.save();
      return res.status(200).json({ message: "Artist removed" });
    }

    user.favArtists.push(artistID);
    user.save();
    res.status(200).json({ message: "You are now folloing this Artist" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userID = req.user!.id;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (userID != user._id && req.user!.type != "Admin")
      return res.status(401).json({ message: "Cannot delete other users" });
    await User.findByIdAndDelete(req.params.id);
    const artistPages = await Artist.find({ userID: req.params.id });
    if (artistPages.length > 0) {
      artistPages.forEach((element) => {
        deleteArtistPageByID(element._id);
      });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!(req.user!.type === "Admin")) {
      return res.status(500).json({ message: "Permission denied" });
    }
    const usersRes = await User.find({});
    if (usersRes.length === 0) {
      res.status(200).json({ users: [] });
    }
    return res.status(200).json({ users: usersRes });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error during fetching users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "Wrong email or password, please try again" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Wrong email or password, please try again" });
    }

    generateTokenAndSetCookie(user._id.toString(), user.type, res);

    const userResponse = { ...user.toObject(), password: undefined };
    res.status(200).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};
export const logoutUser = async (req: Request, res: Response) => {
  try {
    logout(res);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { type, email, password, firstName, lastName, favGenres, favArtists } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      type,
      favGenres,
      favArtists,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered, please check your email for verification code",
    });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    let user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.type === "Artist") {
      const artistPage = await Artist.findOne({ userID: user._id });
      if (artistPage) Object.assign(user, { artistPageID: artistPage!._id });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

export const acceptSpotify = async (req: Request, res: Response) => {
  try {
    let data = req.body;
    let user;
    const sdk = SpotifyApi.withAccessToken(
      "22eaa0b904d84646b189e3929ed13bc7",
      data
    );
    //send token
    // finally
    const firstFollowed = await sdk.currentUser.followedArtists("", 50);
    const totalIterations = (firstFollowed.artists.total - 50) / 50;
    let followedArtistsIds: string[] = [];
    firstFollowed.artists.items.map((a: any) => {
      saveSpotifyArtist(a);
      followedArtistsIds.push(a.id);
    });
    let lastArtist = firstFollowed.artists.cursors.after;
    for (var i = 0; i < totalIterations; i++) {
      let followed = await sdk.currentUser.followedArtists(lastArtist, 50);
      lastArtist = followed.artists.cursors.after;
      followed.artists.items.map((a: any) => {
        saveSpotifyArtist(a);
        followedArtistsIds.push(a.id);
      });
    }
    const userProfile = await sdk.currentUser.profile();
    user = await User.findOneAndUpdate(
      { spotifyId: userProfile.id },
      {
        email: userProfile.email,
        firstName: userProfile.display_name,
        favArtists: followedArtistsIds,
      }
    );
    if (user == null) {
      user = new User({
        email: userProfile.email,
        password: " ",
        firstName: userProfile.display_name,
        lastName: " ",
        type: "User",
        favGenres: [],
        favArtists: followedArtistsIds,
        spotifyId: userProfile.id,
      });
      await user.save();
    }
    generateTokenAndSetCookie(user._id.toString(), user.type, res);
    const userResponse = { ...user.toObject(), password: undefined };
    res.json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};

const saveSpotifyArtist = async (artist: any) => {
  const isExistArtist = await Artist.findOne({ spotifyID: artist.id });
  if (!isExistArtist) {
    const newArtist = new Artist({
      spotifyID: artist.id,
      name: artist.name,
      genres: artist.genres ? artist.genres : [],
      profileImage:
        artist.images.length > 0
          ? artist.images[0].url
          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      externalLinks: {
        youtube: undefined,
        itunes: undefined,
        spotify: undefined,
        instagram: undefined,
      },
    });
    newArtist.save();
  }
};
