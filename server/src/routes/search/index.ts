import { Router } from "express";
import { search, searchLocation, getHomepageData } from "./controller";

export const searchRouter = Router();
searchRouter.get("/", search);
searchRouter.get("/location", searchLocation);
searchRouter.get("/popular", getHomepageData);
