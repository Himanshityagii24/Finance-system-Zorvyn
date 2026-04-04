import './config/env';
import app from './app';
import { config } from './config/env';
import { prisma } from './config/prisma';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(config.port, () => {
      console.log(`Server running → http://localhost:${config.port}`);
      console.log(`Health check  → http://localhost:${config.port}/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();