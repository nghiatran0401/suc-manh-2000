import { NextFunction, Request, Response } from "express";

export const ErrorMiddleware = async (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err)
  }
  
  const code = err?.statusCode || 500;
  res.status(code).send({
    statusCode: code,
    message: err?.message || 'internal server error'
  });
}

export class AppError extends Error {
  public statusCode: number = 500;

  constructor(data: {
    statusCode?: number,
    message: string,
  }) {
    super(data.message);
    this.name = 'AppError';
    this.statusCode = data.statusCode || this.statusCode;
  }
}