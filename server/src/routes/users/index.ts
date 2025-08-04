import { Router } from "express";
import {
  deleteUser,
  updateUser,
  getUserById,
  registerUser,
  loginUser,
  logoutUser,
  acceptSpotify,
  getMe,
  attendEvent,
  followArtist,
  resetPassword,
  getSavedData,
  getUsers,
} from "./controller";
import { authenticateToken } from "../../middlewares";

export const userRouter = Router();
userRouter.post("/", registerUser);
userRouter.post("/spotify/accept-user-token", acceptSpotify);
userRouter.post("/login", loginUser);
userRouter.post("/save-event", authenticateToken, attendEvent);
userRouter.get("/get-saved-data", authenticateToken, getSavedData);
userRouter.post("/follow-artist", authenticateToken, followArtist);
userRouter.post("/reset-password", authenticateToken, resetPassword);
userRouter.get("/me", authenticateToken, getMe);
userRouter.post("/logout", authenticateToken, logoutUser);
userRouter.get("/:id", authenticateToken, getUserById);
userRouter.get("/", authenticateToken, getUsers);
userRouter.patch("/:id", authenticateToken, updateUser);
userRouter.delete("/:id", authenticateToken, deleteUser);
