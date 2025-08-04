import { Router } from "express";
import {
  createArtistPage,
  getArtistPage,
  updateArtistPage,
  deleteArtistPage,
  searchArtistPage,
  getMyArtistPage,
  getAllArtists,
} from "./controller";
import { authenticateToken, imageUploader } from "../../middlewares";

export const artistRouter = Router();
// image uploder needs to be after createArtistPage/updateArtistPage
artistRouter.post("/", authenticateToken, imageUploader, createArtistPage);
artistRouter.get("/me", authenticateToken, getMyArtistPage);
artistRouter.get("/:id", getArtistPage);
artistRouter.get("/", authenticateToken, getAllArtists);
artistRouter.patch("/:id", authenticateToken, imageUploader, updateArtistPage);
artistRouter.delete("/:id", authenticateToken, deleteArtistPage);
artistRouter.get("/search", searchArtistPage);
