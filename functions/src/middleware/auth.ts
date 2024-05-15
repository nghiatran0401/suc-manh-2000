import { NextFunction, Request, Response } from "express";
import firebase from "../firebase";

export const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (token != null && token != "") {
    firebase
      .auth()
      .verifyIdToken(token)
      .then(async (decodedToken) => {
        res.locals = decodedToken;
        next();
      })
      .catch((error) => {
        res.sendStatus(403);
      });
  } else {
    res.sendStatus(403);
  }
};

