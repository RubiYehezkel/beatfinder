import { IEvent } from "@models/event";
import {
  MyQuery,
  convertToUTCDate,
  isValidEvent,
} from "../../src/routes/search/controller";
import { TicketMasterEvent } from "../../src/routes/search/controller";
const axios = require("axios");
import dotenv from "dotenv";
import _ from "lodash";
import moment from "moment";

dotenv.config();
const tmApiKey: any = process.env.TICKETMASTER_SECRET_KEY;

export const getGenreId = (name: string) => {
  const ticketmasterGenreIds = [
    { id: "KnvZfZ7vAvd", name: "Blues" },
    { id: "KnvZfZ7vAv6", name: "Country" },
    { id: "KnvZfZ7vAvF", name: "Dance/Electronic" },
    { id: "KnvZfZ7vAva", name: "Folk" },
    { id: "KnvZfZ7vAv1", name: "Hip-Hop/Rap" },
    { id: "KnvZfZ7vAvE", name: "Jazz" },
    { id: "KnvZfZ7vAJ6", name: "Latin" },
    { id: "KnvZfZ7vAvt", name: "Metal" },
    { id: "KnvZfZ7vAed", name: "Reggae" },
    { id: "KnvZfZ7vAeA", name: "Rock" },
    { id: "KnvZfZ7vAeJ", name: "Classical" },
    { id: "KnvZfZ7v7nI", name: "Dance" },
    { id: "KnvZfZ7v7lk", name: "Opera" },
    { id: "KnvZfZ7vAev", name: "Pop" },
    { id: "KnvZfZ7vAee", name: "RnB" },
  ];

  for (const element of ticketmasterGenreIds) {
    if (name === element.name) {
      return element.id;
    }
  }

  return "";
};

export const getGenreName = (id: string) => {
  const ticketmasterGenreIds = [
    { id: "KnvZfZ7vAvd", name: "Blues" },
    { id: "KnvZfZ7vAv6", name: "Country" },
    { id: "KnvZfZ7vAvF", name: "Dance/Electronic" },
    { id: "KnvZfZ7vAva", name: "Folk" },
    { id: "KnvZfZ7vAv1", name: "Hip-Hop/Rap" },
    { id: "KnvZfZ7vAvE", name: "Jazz" },
    { id: "KnvZfZ7vAJ6", name: "Latin" },
    { id: "KnvZfZ7vAvt", name: "Metal" },
    { id: "KnvZfZ7vAed", name: "Reggae" },
    { id: "KnvZfZ7vAeA", name: "Rock" },
    { id: "KnvZfZ7vAeJ", name: "Classical" },
    { id: "KnvZfZ7v7nI", name: "Dance" },
    { id: "KnvZfZ7v7lk", name: "Opera" },
    { id: "KnvZfZ7vAev", name: "Pop" },
    { id: "KnvZfZ7vAee", name: "RnB" },
  ];

  for (const element of ticketmasterGenreIds) {
    if (id === element.id) {
      return element.name;
    }
  }

  return "";
};

export const getTMArtist = async (artistName: string) => {
  try {
    const getArtistUrl =
      "https://app.ticketmaster.com/discovery/v2/attractions";
    const response = await axios.get(getArtistUrl, {
      params: {
        apikey: process.env.TICKETMASTER_SECRET_KEY,
        keyword: artistName,
        size: "1",
      },
    });
    if (response.data.page.totalElements === 0) {
      return undefined;
    }

    if (
      response.data._embedded.attractions[0].name.toLowerCase() !==
      artistName.toLowerCase()
    ) {
      return undefined;
    }
    return response.data._embedded.attractions[0];
  } catch (err) {
    console.error(err);
  }
};
export const getArtistNameFromTMId = async (artistName: string) => {
  try {
    const getArtistUrl =
      "https://app.ticketmaster.com/discovery/v2/attractions";
    const response = await axios
      .get(getArtistUrl, {
        params: {
          apikey: process.env.TICKETMASTER_SECRET_KEY,
          id: artistName,
          size: "1",
        },
      })
      .then((response: any) => {
        const name = response.data._embedded.attractions[0].name;
        return name;
      });
  } catch (err) {
    console.error(err);
  }
};

export const getExternalEvents = async (tmID: string) => {
  if (tmID) {
    try {
      const getEventsUrl = "https://app.ticketmaster.com/discovery/v2/events";
      const eventsResponse = await axios.get(getEventsUrl, {
        params: {
          apikey: process.env.TICKETMASTER_SECRET_KEY,
          attractionId: tmID,
          size: "5",
        },
      });
      let artistPageEvents: IEvent[] = [];
      if (eventsResponse.data._embedded != undefined) {
        for (const element of eventsResponse.data._embedded.events) {
          const ArtistPageEvent = {
            eventName: element.name,
            dateTime: element.dates.start?.dateTime
              ? new Date(element.dates.start.dateTime).toISOString()
              : convertToUTCDate(element.dates.start.localDate),
            tmId: element.id,
            venue: element._embedded.venues[0].name,
            country: element._embedded.venues[0].country.name,
            city: element._embedded.venues[0].city.name,
          };
          artistPageEvents.push(ArtistPageEvent);
        }
      }
      _.orderBy(artistPageEvents, ["dateTime"]); // sorting events by dateTime
      return artistPageEvents;
    } catch (error: any) {
      throw Error;
    }
  } else {
    return [];
  }
};

export const getEvent = async (eventId: string) => {
  try {
    const getEventsUrl = `https://app.ticketmaster.com/discovery/v2/events/${eventId}`;
    let event: IEvent = {};
    const eventsResponse = await axios
      .get(getEventsUrl, {
        params: {
          apikey: process.env.TICKETMASTER_SECRET_KEY,
        },
      })
      .then((response: any) => {
        event.eventName = response.data.name;
        event.genres = response.data.classifications[0].subGenre
          ? [
              response.data.classifications[0].genre?.name,
              response.data.classifications[0].subGenre?.name,
            ]
          : [response.data.classifications[0].genre?.name];
        event.venue = response.data._embedded.venues[0].name;
        event.venueAddress = response.data._embedded.venues[0].address?.line1;
        event.country = response.data._embedded.venues[0].country.name;
        event.city = response.data._embedded.venues[0].city.name;
        event.accessibility =
          response.data._embedded.venues[0]?.accessibleSeatingDetail;
        event.parkingDetail = response.data._embedded.venues[0]?.parkingDetail;
        event.generalInfo =
          response.data._embedded.venues[0]?.generalInfo?.generalRule;
        event.url = response.data.url;
        event.timezone = response.data._embedded.venues[0].timezone
          ? response.data._embedded.venues[0].timezone
          : "";
        (event.dateTime = response.data.dates.start?.dateTime
          ? new Date(response.data.dates.start.dateTime).toISOString()
          : convertToUTCDate(response.data.dates.start.localDate)),
          (event.coverImage = response.data.images[5].url);
        event.description = response.data.info;
        let lineupArr: {
          name: string;
          image: string;
        }[] = [];

        if (response.data._embedded.attractions) {
          for (
            let i = 1;
            i < response.data._embedded.attractions.length - 1;
            i++
          ) {
            const element = {
              name: response.data._embedded.attractions[i].name,
              image: response.data._embedded.attractions[i].images[0].url,
            };
            lineupArr.push(element);
          }
        }
        event.lineUp = lineupArr;
      });

    return event;
  } catch (error: any) {
    console.log(error);

    throw Error;
  }
};

export const getAbout = async (name: string) => {
  try {
    const url = "http://ws.audioscrobbler.com/2.0/";
    const apikey = process.env.LASTFM_API_KEY;
    const response = await axios.get(url, {
      params: {
        api_key: apikey,
        method: "artist.getinfo",
        artist: name,
        format: "json",
      },
    });

    if (response.status == 200) {
      return response.data?.artist?.bio?.summary
        ? response.data.artist.bio.summary
        : "Read more at Last.fm";
    } else return "";
  } catch (error: any) {
    throw Error;
  }
};

export const handleTMEventsSearch = async (query: MyQuery) => {
  try {
    const getTMEventsUrl = "https://app.ticketmaster.com/discovery/v2/events";
    const response = await axios.get(getTMEventsUrl, {
      params: query,
    });

    if (
      response.status === 200 &&
      response.data.page.totalPages > 0 &&
      response.data._embedded != undefined
    ) {
      const events: TicketMasterEvent[] = [];
      for (const element of response.data._embedded.events) {
        let venueName = "";
        let venueAddress = "";
        if (element._links.venues) {
          try {
            const venueLink = `https://app.ticketmaster.com${element._links.venues[0].href}`;
            const venueRes = await axios.get(venueLink, {
              params: {
                apikey: tmApiKey,
              },
            });
            if (venueRes.status !== 404) {
              venueName = venueRes.data.name;
              venueAddress = venueRes.data.address.line1;
            }
          } catch (error) {
            venueName = "Unknown Venue";
            venueAddress = "Unknown Address";
            continue;
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
          city: element._embedded.venues[0].city.name,
          country: element._embedded.venues[0].country.name,
          url: element.url,
          dateTime: element.dates.start?.dateTime
            ? new Date(element.dates.start.dateTime).toISOString()
            : convertToUTCDate(element.dates.start.localDate),
          coverImage: element.images[0].url,
          tmId: element.id,
        };

        if (
          (isValidEvent(query, event) && !query.hasOwnProperty("genres")) ||
          (isValidEvent(query, event) &&
            _.includes(event.genres, query.genres[0]))
        ) {
          events.push(event);
        }
      }
      return events;
    } else {
      return [];
    }
  } catch (error: any) {
    return [];
  }
};

export function removeDuplicateEvents(
  events: (TicketMasterEvent | IEvent)[]
): (TicketMasterEvent | IEvent)[] {
  const seen = new Set();
  return events.filter((event) => {
    const identifier = `${event.eventName}-${event.venue}-${event.dateTime}`;
    if (seen.has(identifier)) {
      return false;
    } else {
      seen.add(identifier);
      return true;
    }
  });
}

export const getTMHomepageEventsByLocation = async (query: string) => {
  try {
    const location = JSON.parse(query);
    const startDate = new Date().toISOString().split("T");
    const endDate = addDaysToDate(startDate[0], 7).toISOString().split("T");
    const getTMEventsUrl = "https://app.ticketmaster.com/discovery/v2/events";
    const response = await axios.get(getTMEventsUrl, {
      params: {
        apikey: tmApiKey,
        classificationName: "music",
        size: "10",
        city: location.city,
        country: location.country,
        startDateTime: convertToUTCDate(startDate[0]),
        endDateTime: convertToUTCDate(endDate[0]),
      },
    });

    if (
      response.status === 200 &&
      response.data.page.totalPages > 0 &&
      response.data._embedded != undefined
    ) {
      const events = [];
      for (const element of response.data._embedded.events) {
        let venueName = "";
        let venueAddress = "";
        if (element._links.venues) {
          try {
            const venueLink = `https://app.ticketmaster.com${element._links.venues[0].href}`;
            const venueRes = await axios.get(venueLink, {
              params: {
                apikey: tmApiKey,
              },
            });
            if (venueRes.status !== 404) {
              venueName = venueRes.data.name;
              venueAddress = venueRes.data.address.line1;
            }
          } catch (error) {
            venueName = "Unknown Venue";
            venueAddress = "Unknown Address";
            continue;
          }
        }

        const event = {
          eventName: element.name,
          venue: venueName,
          dateTime: element.dates.start?.dateTime
            ? new Date(element.dates.start.dateTime).toISOString()
            : convertToUTCDate(element.dates.start.localDate),
          coverImage: element.images[5].url,
          tmId: element.id,
        };

        events.push(event);
      }
      return events;
    } else {
      return [];
    }
  } catch (error: any) {
    return [];
  }
};

export function addDaysToDate(date: string | Date, days: number): Date {
  return moment(date).add(days, "days").toDate();
}
