import { Request, Response, NextFunction } from "express";
import jwt, { VerifyCallback } from "jsonwebtoken";
import { IUser } from "../models";

const secretKey = process.env.JWT_SECRET_KEY || "your_secret_key_here";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) return res.sendStatus(401);

  const verifyCallback: VerifyCallback<IUser> = (err: any, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  };

  //@ts-ignore
  jwt.verify(token, secretKey, verifyCallback);
};

export const generateTokenAndSetCookie = (
  userId: string,
  userType: string,
  res: Response
) => {
  const token = jwt.sign({ id: userId, type: userType }, secretKey, {
    expiresIn: "24h",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: "24h" });
};

export const logout = (res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "strict",
    expires: new Date(0),
  });
};
