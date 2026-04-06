import '../config/env';
import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing data');

  // Create users
  const adminHash    = await bcrypt.hash('admin123', 12);
  const analystHash  = await bcrypt.hash('analyst123', 12);
  const viewerHash   = await bcrypt.hash('viewer123', 12);
  const inactiveHash = await bcrypt.hash('inactive123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@finance.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@finance.com',
      passwordHash: analystHash,
      role: 'ANALYST',
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@finance.com',
      passwordHash: viewerHash,
      role: 'VIEWER',
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Inactive User',
      email: 'inactive@finance.com',
      passwordHash: inactiveHash,
      role: 'VIEWER',
      isActive: false,
    },
  });

  console.log('👥 Created 4 users');

  // Create financial records
  await prisma.financialRecord.createMany({
    data: [
      // Admin records
      { amount: 150000, type: 'INCOME',  category: 'Salary',    date: new Date('2025-01-10'), notes: 'January salary',           createdById: admin.id },
      { amount: 25000,  type: 'EXPENSE', category: 'Rent',      date: new Date('2025-01-05'), notes: 'January rent',             createdById: admin.id },
      { amount: 150000, type: 'INCOME',  category: 'Salary',    date: new Date('2025-02-10'), notes: 'February salary',          createdById: admin.id },
      { amount: 12000,  type: 'EXPENSE', category: 'Food',      date: new Date('2025-02-15'), notes: 'Groceries and dining',     createdById: admin.id },
      { amount: 150000, type: 'INCOME',  category: 'Salary',    date: new Date('2025-03-10'), notes: 'March salary',             createdById: admin.id },
      { amount: 18000,  type: 'EXPENSE', category: 'Travel',    date: new Date('2025-03-20'), notes: 'Business trip to Mumbai',  createdById: admin.id },
      { amount: 45000,  type: 'INCOME',  category: 'Freelance', date: new Date('2025-03-25'), notes: 'Website project payment',  createdById: admin.id },
      { amount: 8000,   type: 'EXPENSE', category: 'Utilities', date: new Date('2025-04-01'), notes: 'Electricity and internet', createdById: admin.id },
      { amount: 150000, type: 'INCOME',  category: 'Salary',    date: new Date('2025-04-10'), notes: 'April salary',             createdById: admin.id },
      { amount: 35000,  type: 'EXPENSE', category: 'Shopping',  date: new Date('2025-04-15'), notes: 'Electronics purchase',     createdById: admin.id },

      // Analyst records
      { amount: 80000, type: 'INCOME',  category: 'Salary',    date: new Date('2025-01-10'), notes: 'January salary',     createdById: analyst.id },
      { amount: 15000, type: 'EXPENSE', category: 'Rent',      date: new Date('2025-01-05'), notes: 'January rent',       createdById: analyst.id },
      { amount: 80000, type: 'INCOME',  category: 'Salary',    date: new Date('2025-02-10'), notes: 'February salary',    createdById: analyst.id },
      { amount: 9000,  type: 'EXPENSE', category: 'Food',      date: new Date('2025-02-20'), notes: 'Monthly groceries',  createdById: analyst.id },
      { amount: 20000, type: 'INCOME',  category: 'Bonus',     date: new Date('2025-02-28'), notes: 'Performance bonus',  createdById: analyst.id },
      { amount: 80000, type: 'INCOME',  category: 'Salary',    date: new Date('2025-03-10'), notes: 'March salary',       createdById: analyst.id },
      { amount: 5000,  type: 'EXPENSE', category: 'Utilities', date: new Date('2025-03-15'), notes: 'Monthly bills',      createdById: analyst.id },

      // Viewer records
      { amount: 50000, type: 'INCOME',  category: 'Salary', date: new Date('2025-01-10'), notes: 'January salary',  createdById: viewer.id },
      { amount: 10000, type: 'EXPENSE', category: 'Rent',   date: new Date('2025-01-05'), notes: 'January rent',    createdById: viewer.id },
      { amount: 50000, type: 'INCOME',  category: 'Salary', date: new Date('2025-02-10'), notes: 'February salary', createdById: viewer.id },
      { amount: 6000,  type: 'EXPENSE', category: 'Food',   date: new Date('2025-02-18'), notes: 'Groceries',       createdById: viewer.id },
    ],
  });

  console.log('📊 Created 21 financial records');
  console.log('\n✅ Seed completed!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Test credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ADMIN    → admin@finance.com    / admin123');
  console.log('  ANALYST  → analyst@finance.com  / analyst123');
  console.log('  VIEWER   → viewer@finance.com   / viewer123');
  console.log('  INACTIVE → inactive@finance.com / inactive123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });