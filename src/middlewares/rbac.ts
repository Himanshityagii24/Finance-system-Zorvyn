import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required: [${roles.join(', ')}] — your role: ${req.user.role}`
        )
      );
    }
    next();
  };
};

export const adminOnly       = requireRole('ADMIN');
export const analystAndAbove = requireRole('ANALYST', 'ADMIN');
export const allRoles        = requireRole('VIEWER', 'ANALYST', 'ADMIN');