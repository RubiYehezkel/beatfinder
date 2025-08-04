import { Request, Response } from "express";
import { Event, IEvent } from "../../models/event";
import { getEvent, addDaysToDate } from "../../utils/ticketmasterApi";
import { MyQuery, convertToUTCDate } from "../search/controller";
import { Artist } from "../../models/artist";
import {
  deletePhotoByName,
  deletePhotoByPath,
} from "../../middlewares/uploader";
import { getGenreName } from "../../utils/ticketmasterApi";
import _ from "lodash";

const assetsPath = `/assets/`;

export const createEvent = async (req: Request, res: Response) => {
  const deleteUploadedPhoto = () => {
    if (req.file) {
      deletePhotoByName(req.file.filename);
    }
  };

  try {
    if (req.user!.type === "User") {
      deleteUploadedPhoto();
      return res.status(401).json({ message: "unauthorized" });
    }
    const artist = await Artist.findOne({ userID: req.user?.id });

    if (!artist) {
      deleteUploadedPhoto();
      return res.status(404).json({ message: "artist not fount" }); // Send error response
    }
    const newEvent = new Event(req.body);
    newEvent.artistID = artist!.id;
    newEvent.userID = req.user!.id;
    newEvent.modifiedDateTime = req.body.dateTime;
    newEvent.lineUp = [
      {
        name: artist.name!,
        image: artist.profileImage!,
      },
    ];
    if (artist?.userID != req.user!.id && !(req.user!.type === "Admin")) {
      deleteUploadedPhoto();
      return res
        .status(401)
        .json({ message: "you cannot post events on others pages" }); // Send error response
    }
    if (!newEvent) {
      deleteUploadedPhoto();
      return res.status(400).json({ message: "event empty" }); // Send error response
    }
    if (req.file) {
      newEvent.coverImage = assetsPath + req.file!.filename;
    }

    let temp = newEvent.genres![0];
    newEvent.genres = temp.split(",");

    await newEvent.save();
    return res.status(200).json(newEvent); // Send success response
  } catch (error: any) {
    deleteUploadedPhoto();
    return res.status(400).json({ message: error.message }); // Send error response
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const oldEvent = await Event.findById(req.params.id);
    if (oldEvent) {
      if (userId != oldEvent.userID && !(req.user!.type === "Admin")) {
        return res.status(401).json("You cannot edit others profiles");
      }

      if (req.file) {
        deletePhotoByPath(oldEvent?.coverImage as string);
        oldEvent.coverImage = assetsPath + req.file!.filename;
      }
      oldEvent.set(req.body);
      const updatedEvent = await oldEvent.save();
      return res.status(200).json(updatedEvent);
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.coverImage) {
      deletePhotoByPath(event.coverImage);
    }
    return res.status(200).json({ message: "Event deleted" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEventByID = async (id: string) => {
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) throw Error;

    if (event.coverImage) {
      deletePhotoByPath(event.coverImage);
    }
    return true;
  } catch (error: any) {
    throw Error;
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    if (req.user!.type === "Admin") {
      const event = await Event.find({});
      return res.status(200).json(event);
    }
    if (req.user!.type === "Artist") {
      const event = await Event.find({ userID: req.user?.id });
      return res.status(200).json(event);
    } else return res.status(404);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getArtistPageEvents = async (id: string) => {
  try {
    const events = await Event.find({ artistID: id });
    return events;
  } catch (error: any) {
    throw error;
  }
};

export const getEventsByArtist = async (req: Request, res: Response) => {
  try {
    const artistName = req.body.name;
    const events = await Event.find({ name: artistName });
    return res.status(200).json(events);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEventsByID = async (req: Request, res: Response) => {
  const id = req.params.id;
  const existingEvent = await Event.findOne({ tmID: id });

  try {
    if (id.startsWith("bf_")) {
      const event = await Event.findById(req.params.id);
      res.status(200).json(event);
    } else if (existingEvent?.id) {
      res.status(200).json(existingEvent);
    } else {
      const event = await getEvent(id);
      res.status(200).json(event);
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const searchEvent = async (keyword: string) => {
  try {
    let query: any = {};

    const nameRegex = new RegExp(`^${keyword}`, "i");
    query.eventName = nameRegex;

    const events = await Event.find(query);
    return events;
  } catch (error: any) {
    throw Error;
  }
};
export const searchEventByQuery = async (query: MyQuery) => {
  try {
    let eventPages: IEvent[] = [];
    if (query.hasOwnProperty("genreId")) {
      if (query.genreId !== "") {
        Object.assign(query, {
          genres: getGenreName(query.genreId as string),
        });
      } else {
        Object.assign(query, {
          genres: "Israeli",
        });
      }
      delete query.genreId;
    }

    if (query.hasOwnProperty("keyword")) {
      const nameRegex = new RegExp(`^${query.keyword}`, "i");
      Object.assign(query, {
        eventName: nameRegex,
      });

      delete query.keyword;
    }

    let temp = Object.assign({}, query); //cloning query so there wont be double pointing to the same object

    let newQuery: MyQuery = query;
    delete newQuery.apikey;
    delete newQuery.classificationName;
    delete newQuery.size;

    if (
      temp.hasOwnProperty("genres") &&
      temp.hasOwnProperty("startDateTime") &&
      temp.hasOwnProperty("endDateTime")
    ) {
      const tempGenres = temp.genres;
      const tempStart = new Date(temp.startDateTime as string);
      const tempEnd = new Date(temp.endDateTime as string);

      delete newQuery.genres;
      delete newQuery.startDateTime;
      delete newQuery.endDateTime;
      let newestQuery = {
        ...newQuery,
        genres: { $in: tempGenres },
        modifiedDateTime: {
          $gte: tempStart,
          $lte: tempEnd,
        },
      };
      eventPages = await Event.find(newestQuery).exec();
    }
    if (
      temp.hasOwnProperty("genres") &&
      temp.hasOwnProperty("startDateTime") &&
      !temp.hasOwnProperty("endDateTime")
    ) {
      const tempGenres = temp.genres;
      const tempStart = new Date(temp.startDateTime as string);

      delete newQuery.genres;
      delete newQuery.startDateTime;
      delete newQuery.endDateTime;
      let newestQuery = {
        ...newQuery,
        genres: { $in: tempGenres },
        modifiedDateTime: {
          $gte: tempStart,
        },
      };

      eventPages = await Event.find(newestQuery).exec();
    }

    if (
      temp.hasOwnProperty("genres") &&
      temp.hasOwnProperty("endDateTime") &&
      !temp.hasOwnProperty("startDateTime")
    ) {
      const tempGenres = temp.genres;
      const tempEnd = new Date(temp.endDateTime as string);

      delete newQuery.genres;
      delete newQuery.startDateTime;
      delete newQuery.endDateTime;
      let newestQuery = {
        ...newQuery,
        genres: { $in: tempGenres },
        modifiedDateTime: {
          $lte: tempEnd,
        },
      };
      eventPages = await Event.find(newestQuery).exec();
    }

    if (
      temp.hasOwnProperty("genres") &&
      !temp.hasOwnProperty("startDateTime") &&
      !temp.hasOwnProperty("endDateTime")
    ) {
      const tempGenres = temp.genres;
      delete newQuery.genres;
      delete newQuery.startDateTime;
      delete newQuery.endDateTime;
      let newestQuery = {
        ...newQuery,
        genres: { $in: tempGenres },
      };
      eventPages = await Event.find(newestQuery).exec();
    }

    if (
      temp.hasOwnProperty("startDateTime") &&
      !temp.hasOwnProperty("genres")
    ) {
      if (temp.hasOwnProperty("endDateTime")) {
        const tempStart = new Date(temp.startDateTime as string);
        const tempEnd = new Date(temp.endDateTime as string);

        delete newQuery.genres;
        delete newQuery.startDateTime;
        delete newQuery.endDateTime;
        let newestQuery = {
          ...newQuery,
          modifiedDateTime: {
            $gte: tempStart,
            $lte: tempEnd,
          },
        };

        eventPages = await Event.find(newestQuery).exec();
      } else {
        const tempStart = new Date(temp.startDateTime as string);
        delete newQuery.genres;
        delete newQuery.startDateTime;
        delete newQuery.endDateTime;
        let newestQuery = {
          ...newQuery,
          modifiedDateTime: {
            $gte: tempStart,
          },
        };
        eventPages = await Event.find(newestQuery).exec();
      }
    }
    if (
      temp.hasOwnProperty("endDateTime") &&
      !temp.hasOwnProperty("startDateTime") &&
      !temp.hasOwnProperty("genres")
    ) {
      const tempEnd = new Date(temp.endDateTime as string);

      delete newQuery.genres;
      delete newQuery.startDateTime;
      delete newQuery.endDateTime;
      let newestQuery = {
        ...newQuery,
        modifiedDateTime: {
          $lte: tempEnd,
        },
      };
      eventPages = await Event.find(newestQuery).exec();
    } else if (
      !temp.hasOwnProperty("genres") &&
      !temp.hasOwnProperty("startDateTime") &&
      !temp.hasOwnProperty("endDateTime")
    ) {
      eventPages = await Event.find(newQuery).exec();
    }
    let events: IEvent[] = [];
    if (eventPages) {
      eventPages.forEach((element: any) => {
        const event: IEvent = {
          _id: element._id,
          eventName: element.eventName,
          genres: element.genres,
          venue: element.venue,
          venueAddress: element.venueAddress,
          city: element.city,
          country: element.country,
          url: element.url,
          dateTime: element.dateTime,
          coverImage: element.coverImage,
        };
        events.push(event);
      });
    }
    return events;
  } catch (error: any) {
    return [];
  }
};

export const saveEvent = async (id: string) => {
  try {
    if (id.startsWith("bf_")) {
      return;
    } else {
      const existingEvent = await Event.findOne({ tmID: id });
      if (existingEvent?.id) return;
      const event = await getEvent(id);
      const externalEvent = new Event(event);
      externalEvent.tmID = id;
      externalEvent.save();
    }
  } catch (error: any) {
    console.error(error);
    return;
  }
};

export const getBFHomepageEventsByLocation = async (query: string) => {
  try {
    const location = JSON.parse(query);
    const startDate = new Date().toISOString().split("T");
    const endDate = addDaysToDate(startDate[0], 7).toISOString().split("T");
    const tempStartDate = new Date(convertToUTCDate(startDate[0]));
    const tempEndDate = new Date(convertToUTCDate(endDate[0]));
    const searchQuery = {
      city: location.city,
      country: location.country,
      modifiedDateTime: {
        $gte: tempStartDate,
        $lte: tempEndDate,
      },
    };

    const events = await Event.find(searchQuery).exec();
    let outputEvents = [];
    for (let element of events) {
      const event = {
        _id: element._id,
        eventName: element.eventName,
        venue: element.venue,
        dateTime: element.dateTime,
        coverImage: element.coverImage,
      };
      outputEvents.push(event);
    }

    return outputEvents;
  } catch (error: any) {
    throw error;
  }
};
