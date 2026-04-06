import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log full error details in terminal
  console.error('═══════════════════════════════');
  console.error('ERROR on:', req.method, req.path);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('═══════════════════════════════');

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};