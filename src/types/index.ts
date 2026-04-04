export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}