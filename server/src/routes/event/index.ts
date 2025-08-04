import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  getEvents,
  getEventsByArtist,
  getEventsByID,
} from "./controller";
import { authenticateToken, imageUploader } from "../../middlewares";

export const eventRouter = Router();

// image uploder needs to be after createEvent\updateEvent

eventRouter.get("/", authenticateToken, getEvents);
eventRouter.post("/", authenticateToken, imageUploader, createEvent);
eventRouter.patch("/:id", authenticateToken, imageUploader, updateEvent);
eventRouter.delete("/:id", authenticateToken, deleteEvent);
eventRouter.get("/search", getEventsByArtist);
eventRouter.get("/:id", getEventsByID);
