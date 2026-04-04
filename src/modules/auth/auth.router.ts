import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authLimiter } from '../../middlewares/rateLimiter';
import { registerSchema, loginSchema } from './auth.schema';
import { registerUser, loginUser, getMe } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const router = Router();

// POST /auth/register
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await registerUser(req.body);
      sendCreated(res, result, 'Registration successful');
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await loginUser(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }
);

// GET /auth/me 
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getMe(req.user!.userId);
      sendSuccess(res, user, 'Profile fetched');
    } catch (err) {
      next(err);
    }
  }
);

export default router;