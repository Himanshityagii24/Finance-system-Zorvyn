import './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import recordsRouter from './modules/records/records.router';
import dashboardRouter from './modules/dashboard/dashboard.router';

const app = express();

// Security & logging
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(globalLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Debug route — test prisma directly
app.get('/debug/test', async (_req, res) => {
  try {
    const count = await (await import('./config/prisma')).prisma.financialRecord.count();
    res.json({ success: true, recordCount: count });
  } catch (err: any) {
    res.json({ success: false, error: err.message });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;