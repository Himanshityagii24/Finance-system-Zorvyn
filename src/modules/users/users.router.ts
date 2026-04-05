import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  updateUserSchema,
  updateRoleSchema,
  getUsersQuerySchema,
} from './users.schema';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from './users.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const router = Router();

// All users routes require login + ADMIN role
router.use(authenticate, adminOnly);

// GET /api/users — get all users with filters + pagination + search
router.get(
  '/',
  validate(getUsersQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getAllUsers(req.query as any);
      sendSuccess(res, result.users, 'Users fetched', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/users/:id 
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getUserById(req.params.id);
      sendSuccess(res, user, 'User fetched');
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/:id — update user name/email/isActive
router.patch(
  '/:id',
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await updateUser(
        req.params.id,
        req.user!.userId,
        req.body
      );
      sendSuccess(res, user, 'User updated');
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/:id/role — change user role
router.patch(
  '/:id/role',
  validate(updateRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await updateUserRole(
        req.params.id,
        req.user!.userId,
        req.body
      );
      sendSuccess(res, user, 'Role updated');
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/:id/toggle-status — activate or deactivate user
router.patch(
  '/:id/toggle-status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await toggleUserStatus(req.params.id, req.user!.userId);
      sendSuccess(
        res,
        user,
        `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/users/:id — delete user permanently
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deleteUser(req.params.id, req.user!.userId);
      sendSuccess(res, result, 'User deleted');
    } catch (err) {
      next(err);
    }
  }
);

export default router;