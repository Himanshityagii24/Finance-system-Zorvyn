import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { analystAndAbove, allRoles } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  createRecordSchema,
  updateRecordSchema,
  getRecordsQuerySchema,
} from './records.schema';
import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from './records.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const router = Router();

// All records routes require login
router.use(authenticate);

// GET /api/records — get all records (with filters, search, pagination)
// VIEWER sees own, ANALYST sees own, ADMIN sees all
router.get(
  '/',
  allRoles,
  validate(getRecordsQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getAllRecords(
        req.query as any,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, result.records, 'Records fetched', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/records/:id 
router.get(
  '/:id',
  allRoles,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await getRecordById(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, record, 'Record fetched');
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/records — create record (ANALYST and ADMIN only)
router.post(
  '/',
  analystAndAbove,
  validate(createRecordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await createRecord(req.body, req.user!.userId);
      sendCreated(res, record, 'Record created successfully');
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/records/:id — update record (ADMIN only for any, ANALYST for own)
router.put(
  '/:id',
  analystAndAbove,
  validate(updateRecordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await updateRecord(
        req.params.id,
        req.body,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, record, 'Record updated');
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/records/:id — soft delete (ADMIN only)
router.delete(
  '/:id',
  analystAndAbove,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deleteRecord(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, result, 'Record deleted');
    } catch (err) {
      next(err);
    }
  }
);

export default router;