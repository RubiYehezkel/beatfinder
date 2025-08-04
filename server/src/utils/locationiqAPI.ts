import dotenv from "dotenv";
import _ from "lodash";
const axios = require("axios");
import { capitalizeEveryWord } from "./regexCheck";

dotenv.config();
const lcoationiqApiKey: any = process.env.LOCATIONIQ_API_KEY;

export type suggestedLocation = {
  city: string;
  country: string;
};

export const getSuggestedLocation = async (query: string) => {
  try {
    const getLocationUrl = "https://api.locationiq.com/v1/autocomplete";
    const response = await axios.get(getLocationUrl, {
      params: {
        key: lcoationiqApiKey,
        q: query,
        "accept-language": "en",
      },
    });

    if (response.data.length === 0) {
      return [];
    }

    let queryResults: suggestedLocation[] = [];
    for (const element of response.data) {
      if (element.type === "city") {
        const q = {
          city: element.address.name,
          country: element.address.country,
        };
        queryResults.push(q);
      }
    }

    queryResults = _.uniqBy(
      queryResults,
      (location) => `${location.city}-${location.country}`
    );
    queryResults.forEach((element) => {
      if (element.country === "United Kingdom") {
        element.country = "Great Britain";
      }
      element.country = capitalizeEveryWord(element.country);
      element.city = capitalizeEveryWord(element.city);
    });

    return queryResults;
  } catch (err) {
    return [];
  }
};
