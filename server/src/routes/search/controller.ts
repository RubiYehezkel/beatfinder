import { Request, Response, json } from "express";
import {
  spotifySearchArtist,
  spotifySearchArtistByGenre,
  handleTMEventsSearch,
  handleSpotifyQuery,
  getTMHomepageEventsByLocation,
} from "../../utils";
import { isValidJsonString } from "../../utils/regexCheck";
import {
  searchArtistPage,
  searchArtistPageByGenre,
  searchArtistPageByKeyword,
  getHomepagePopularArtists,
} from "../artist/controller";
import { searchEvent, searchEventByQuery } from "../event/controller";
import dotenv from "dotenv";
import _ from "lodash";
import { IArtist } from "../../models/artist";
import { getSuggestedLocation } from "../../utils/locationiqAPI";
import { getGenreId, getGenreName, removeDuplicateEvents } from "../../utils";
import { getBFHomepageEventsByLocation } from "../event/controller";

dotenv.config();

const axios = require("axios");
const tmApiKey: any = process.env.TICKETMASTER_SECRET_KEY;

export type MyQuery = {
  [key: string]: string | string[];
};
export interface TicketMasterEvent {
  eventName: string;
  genres: string[];
  venue: string;
  venueAddress: string;
  city: string;
  country: string;
  url: string;
  dateTime: string | Date;
  coverImage: string;
  tmId: string;
}

export function convertToUTCDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  // Manually format the date string to 'YYYY-MM-DDTHH:mm:ssZ'
  const formattedDate =
    utcDate.getUTCFullYear() +
    "-" +
    String(utcDate.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(utcDate.getUTCDate()).padStart(2, "0") +
    "T" +
    String(utcDate.getUTCHours()).padStart(2, "0") +
    ":" +
    String(utcDate.getUTCMinutes()).padStart(2, "0") +
    ":" +
    String(utcDate.getUTCSeconds()).padStart(2, "0") +
    "Z";

  return formattedDate;
}

export type AllowedKeys =
  | "city"
  | "country"
  | "startDateTime"
  | "endDateTime"
  | "genreId"
  | "keyword";

export function isValidEvent(
  obj: MyQuery,
  reference: TicketMasterEvent,
  allowedKeys: AllowedKeys[] = [
    "keyword",
    "city",
    "country",
    "startDateTime",
    "endDateTime",
    "genreId",
  ]
): boolean {
  let newQuery: MyQuery = obj;
  delete newQuery.apikey;
  delete newQuery.classificationName;
  delete newQuery.size;

  // Check if all keys in the object are within the allowed keys
  const objKeys = Object.keys(newQuery);
  const allKeysValid = objKeys.every((key) =>
    allowedKeys.includes(key as AllowedKeys)
  );

  if (!allKeysValid) {
    return false;
  }

  // Check if the values match the reference object's values
  const valuesMatch = objKeys.every((key) => {
    if (key === "startDateTime" || key === "endDateTime") {
      return true;
    }
    if (key === "genreId") {
      return true;
    }
    if (key === "keyword") {
      return true;
    }
    return obj[key] === (reference as any)[key];
  });

  return valuesMatch;
}
export const ticketMasterEventSearch = async (
  keyword: string,
  outputSize: string = "5"
) => {
  try {
    const apikey = tmApiKey;
    const url = "https://app.ticketmaster.com/discovery/v2/events";
    const response = await axios.get(url, {
      params: {
        apikey: apikey,
        keyword: keyword,
        classificationName: "music",
        size: outputSize,
      },
    });

    if (
      response.status === 200 &&
      response.data.page.totalPages > 0 &&
      response.data._embedded != undefined
    ) {
      const events: TicketMasterEvent[] = [];
      let venueName = "Unknown Venue";
      let venueAddress = "Unknown Address";

      for (const element of response.data._embedded.events) {
        if (element._links.venues) {
          try {
            const venueLink = `https://app.ticketmaster.com${element._links.venues[0].href}`;
            const venueRes = await axios.get(venueLink, {
              params: {
                apikey: apikey,
              },
            });

            venueName = venueRes.data.name;
            venueAddress = venueRes.data.address.line1;
          } catch (error) {
            console.error("Error is with venue name or address");
          }
        }

        const event: TicketMasterEvent = {
          eventName: element.name,
          genres: element.classifications[0].subGenre
            ? [
                element.classifications[0].genre?.name,
                element.classifications[0].subGenre?.name,
              ]
            : [element.classifications[0].genre?.name],
          venue: venueName,
          venueAddress: venueAddress,
          city: element._embedded.venues?.city?.name,
          country: element._embedded.venues?.country?.name,
          url: element.url,
          dateTime: element.dates.start?.dateTime
            ? new Date(element.dates.start.dateTime).toISOString()
            : convertToUTCDate(element.dates.start.localDate),
          coverImage: element.images[0]?.url,
          tmId: element.id,
        };

        events.push(event);
      }

      return events;
    } else {
      return [];
    }
  } catch (error: any) {
    console.log(error);

    throw error;
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    if (req.query.filter) {
      //check if filters JSON string object that handed is valid
      const isValid = isValidJsonString(req.query.filter as string);
      if (!isValid) {
        res.status(400).json({ message: "Illegal filters syntax" });
        return;
      }

      const jsonFilters = JSON.parse(req.query.filter as string);
      const keys = Object.keys(jsonFilters);
      const values: string[] = Object.values(jsonFilters);
      const eventsSearchQuery: MyQuery = {
        apikey: tmApiKey,
        classificationName: "music",
        size: "100",
      };
      let spotifyArtistsSearchByGenre: string = "";
      let beatFinderArtistsSearchByGenre: string = "";
      let keywordArtistSearch: string = "";
      let genreToSearch: string = "";
      let outputEvents: (IArtist | TicketMasterEvent)[] = [];
      let outputArtists: IArtist[] = [];

      for (let i in keys) {
        if (_.includes(["keyword"], keys[i])) {
          let obj = {
            [keys[i]]: values[i],
          };
          keywordArtistSearch = values[i];
          _.assign(eventsSearchQuery, obj);
        }

        if (_.includes(["city", "country"], keys[i])) {
          let obj = {
            [keys[i]]: values[i],
          };
          _.assign(eventsSearchQuery, obj);
        }

        if (_.includes(["startDateTime", "endDateTime"], keys[i])) {
          const UTCDate = convertToUTCDate(values[i] as string);
          let obj = {
            [keys[i]]: UTCDate,
          };
          _.assign(eventsSearchQuery, obj);
        }

        if (_.includes(["genres"], keys[i])) {
          let obj = {
            ["genreId"]: getGenreId(values[i]),
          };
          genreToSearch = values[i];
          spotifyArtistsSearchByGenre = `remaster%20genre:${handleSpotifyQuery(
            values[i]
          )}`;
          beatFinderArtistsSearchByGenre = values[i];
          _.assign(eventsSearchQuery, obj);
        }
      }

      let tmEvents: TicketMasterEvent[] = [];
      if (
        (eventsSearchQuery.hasOwnProperty("genreId") &&
          eventsSearchQuery.genreId !== "") ||
        !eventsSearchQuery.hasOwnProperty("genreId")
      ) {
        tmEvents = await handleTMEventsSearch(eventsSearchQuery);
        if (eventsSearchQuery.hasOwnProperty("genreId")) {
          tmEvents = _.filter(tmEvents, (element) => {
            return _.includes(
              element.genres,
              getGenreName(eventsSearchQuery.genreId as string)
            );
          });
        }
      }

      const bfEvents = await searchEventByQuery(eventsSearchQuery);
      let events = [...bfEvents, ...tmEvents];

      if (events.length > 0) {
        outputEvents = _.orderBy(events, ["dateTime"]); //sort events by dateTime
        outputEvents = removeDuplicateEvents(outputEvents); //remove duplicated events
      }
      let artists: IArtist[] = [];
      if (
        spotifyArtistsSearchByGenre !== "" &&
        beatFinderArtistsSearchByGenre !== ""
      ) {
        const beatFinderArtistsByGenre = await searchArtistPageByGenre(
          beatFinderArtistsSearchByGenre
        );

        const spotifyArtistsByGenre = await spotifySearchArtistByGenre(
          spotifyArtistsSearchByGenre,
          20
        );
        artists = [...spotifyArtistsByGenre, ...beatFinderArtistsByGenre];
      }

      if (keywordArtistSearch !== "") {
        const keywordSpotifyArtists = await spotifySearchArtist(
          keywordArtistSearch,
          20
        );
        const keywordBeatfinderArtists = await searchArtistPageByKeyword(
          keywordArtistSearch
        );

        artists = [
          ...artists,
          ...keywordSpotifyArtists,
          ...keywordBeatfinderArtists,
        ];
      }
      outputArtists = _.uniqBy(artists, "name"); //prevent duplicated artist output

      if (
        outputEvents.length === outputArtists.length &&
        outputEvents.length === 0
      ) {
        res.status(200).json({ message: "Events or artists not found" });
        return;
      }

      res.status(200).json({ events: outputEvents, artists: outputArtists });
      return;
    }

    const searchData = await searchBar(req.query.keyword as string);
    res
      .status(200)
      .json({ events: searchData.events, artists: searchData.artists });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const searchBar = async (keyword: string) => {
  try {
    const [
      beatFinderEvents,
      ticketMasterEvents,
      spotifyArtists,
      beatFinderArtists,
    ] = await Promise.all([
      searchEvent(keyword),
      ticketMasterEventSearch(keyword),
      spotifySearchArtist(keyword),
      searchArtistPage(keyword),
    ]);

    let events = [...beatFinderEvents, ...ticketMasterEvents];
    let artists = [...spotifyArtists, ...beatFinderArtists];
    events = _.orderBy(events, ["dateTime"]); //sort events by dateTime
    let outputEvents = removeDuplicateEvents(events); //remove duplicated events
    let outputArtists = _.uniqBy(artists, "name"); //prevent duplicated artist output

    return { events: outputEvents, artists: outputArtists };
  } catch (error: any) {
    throw error;
  }
};

export const searchLocation = async (req: Request, res: Response) => {
  try {
    const response = await getSuggestedLocation(req.query.keyword as string);
    if (response) {
      res.status(200).json({ response });
    } else {
      res.status(404).json({ message: "No results found" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getHomepageData = async (req: Request, res: Response) => {
  try {
    const tmEvents = await getTMHomepageEventsByLocation(
      req.query.location as string
    );
    const bfEvents = await getBFHomepageEventsByLocation(
      req.query.location as string
    );

    let events = [...bfEvents, ...tmEvents];
    events = _.orderBy(events, ["dateTime"]); //sort events by dateTime
    let outputEvents = removeDuplicateEvents(events); //remove duplicated events
    let outputArtists = await getHomepagePopularArtists();
    if (events.length === 0) {
      return res.status(200).json({
        events: [],
        artists: outputArtists,
      });
    }

    return res.status(200).json({
      events: outputEvents,
      artists: outputArtists,
    });
  } catch (error: any) {
    throw error;
  }
};
