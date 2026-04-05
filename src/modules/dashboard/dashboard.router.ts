import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { allRoles } from '../../middlewares/rbac';
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
  getBalanceOverTime,
  getTopCategories,
} from './dashboard.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

// All dashboard routes require login
// All roles can access dashboard (VIEWER, ANALYST, ADMIN)
router.use(authenticate, allRoles);

// GET /api/dashboard/summary
// Total income, expenses, net balance, savings rate
router.get(
  '/summary',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getSummary(req.user!.userId, req.user!.role);
      sendSuccess(res, data, 'Summary fetched');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/dashboard/categories
// Income + expense + net per category
router.get(
  '/categories',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getCategoryBreakdown(req.user!.userId, req.user!.role);
      sendSuccess(res, data, 'Category breakdown fetched');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/dashboard/trends/monthly?year=2024
// Month by month income vs expenses
router.get(
  '/trends/monthly',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const data = await getMonthlyTrends(req.user!.userId, req.user!.role, year);
      sendSuccess(res, data, 'Monthly trends fetched');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/dashboard/trends/weekly
// Last 8 weeks income vs expenses
router.get(
  '/trends/weekly',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getWeeklyTrends(req.user!.userId, req.user!.role);
      sendSuccess(res, data, 'Weekly trends fetched');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/dashboard/recent?limit=10
// Most recent transactions
router.get(
  '/recent',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const data = await getRecentActivity(req.user!.userId, req.user!.role, limit);
      sendSuccess(res, data, 'Recent activity fetched');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/dashboard/balance-over-time
// Running balance across all transactions (timeline)
router.get(
  '/balance-over-time',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getBalanceOverTime(req.user!.userId, req.user!.role);
      sendSuccess(res, data, 'Balance over time fetched');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/dashboard/top-categories?type=EXPENSE&limit=5
// Top spending or earning categories
router.get(
  '/top-categories',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const type = (req.query.type as 'INCOME' | 'EXPENSE') || 'EXPENSE';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const data = await getTopCategories(req.user!.userId, req.user!.role, type, limit);
      sendSuccess(res, data, 'Top categories fetched');
    } catch (err) {
      next(err);
    }
  }
);

export default router;