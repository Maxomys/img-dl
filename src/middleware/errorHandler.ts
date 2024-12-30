import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../ApiError';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
