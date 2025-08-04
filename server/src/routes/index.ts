import { Router } from "express";
import { userRouter } from "./users";
import { eventRouter } from "./event";
import { searchRouter } from "./search";
import { artistRouter } from "./artist"


export const rootRouter = Router();
rootRouter.use("/users", userRouter);
rootRouter.use("/event", eventRouter);
rootRouter.use("/artist", artistRouter);
rootRouter.use("/search", searchRouter);
