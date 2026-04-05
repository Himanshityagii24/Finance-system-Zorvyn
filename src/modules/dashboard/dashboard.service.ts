import { prisma } from '../../config/prisma';

// Helper — build base where clause based on role
const baseWhere = (userId: string, userRole: string) => {
  const where: { isDeleted: boolean; createdById?: string } = { isDeleted: false };
  if (userRole !== 'ADMIN') where.createdById = userId;
  return where;
};


export const getSummary = async (userId: string, userRole: string) => {
  const where = baseWhere(userId, userRole);

  const records = await prisma.financialRecord.findMany({
    where,
    select: { amount: true, type: true },
  });

  const totalIncome = records
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  const totalRecords = records.length;

  const savingsRate =
    totalIncome > 0
      ? parseFloat(((netBalance / totalIncome) * 100).toFixed(2))
      : 0;

  return {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    netBalance: parseFloat(netBalance.toFixed(2)),
    totalRecords,
    savingsRate,
  };
};


interface CategoryData {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export const getCategoryBreakdown = async (userId: string, userRole: string) => {
  const where = baseWhere(userId, userRole);

  const records = await prisma.financialRecord.findMany({
    where,
    select: { amount: true, type: true, category: true },
  });

  const breakdown: { [key: string]: CategoryData } = {};

  for (const record of records) {
    if (!breakdown[record.category]) {
      breakdown[record.category] = { income: 0, expense: 0, net: 0, count: 0 };
    }
    if (record.type === 'INCOME') {
      breakdown[record.category].income += record.amount;
    } else {
      breakdown[record.category].expense += record.amount;
    }
    breakdown[record.category].net =
      breakdown[record.category].income - breakdown[record.category].expense;
    breakdown[record.category].count += 1;
  }

  return Object.entries(breakdown)
    .map(([category, data]) => ({
      category,
      income: parseFloat(data.income.toFixed(2)),
      expense: parseFloat(data.expense.toFixed(2)),
      net: parseFloat(data.net.toFixed(2)),
      count: data.count,
    }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
};


interface MonthData {
  month: number;
  monthName: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export const getMonthlyTrends = async (
  userId: string,
  userRole: string,
  year?: number
) => {
  const where = baseWhere(userId, userRole);
  const targetYear = year || new Date().getFullYear();

  const records = await prisma.financialRecord.findMany({
    where: {
      ...where,
      date: {
        gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
        lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
      },
    },
    select: { amount: true, type: true, date: true },
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const months: { [key: number]: MonthData } = {};

  for (let i = 1; i <= 12; i++) {
    months[i] = {
      month: i,
      monthName: monthNames[i - 1],
      income: 0,
      expense: 0,
      net: 0,
      count: 0,
    };
  }

  for (const record of records) {
    const month = new Date(record.date).getMonth() + 1;
    if (record.type === 'INCOME') {
      months[month].income += record.amount;
    } else {
      months[month].expense += record.amount;
    }
    months[month].net = months[month].income - months[month].expense;
    months[month].count += 1;
  }

  return {
    year: targetYear,
    trends: Object.values(months).map((m) => ({
      ...m,
      income: parseFloat(m.income.toFixed(2)),
      expense: parseFloat(m.expense.toFixed(2)),
      net: parseFloat(m.net.toFixed(2)),
    })),
  };
};


interface WeekData {
  week: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export const getWeeklyTrends = async (userId: string, userRole: string) => {
  const where = baseWhere(userId, userRole);

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const records = await prisma.financialRecord.findMany({
    where: {
      ...where,
      date: { gte: eightWeeksAgo },
    },
    select: { amount: true, type: true, date: true },
  });

  const weeks: { [key: string]: WeekData } = {};

  for (const record of records) {
    const date = new Date(record.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        week: weekKey,
        income: 0,
        expense: 0,
        net: 0,
        count: 0,
      };
    }

    if (record.type === 'INCOME') {
      weeks[weekKey].income += record.amount;
    } else {
      weeks[weekKey].expense += record.amount;
    }
    weeks[weekKey].net = weeks[weekKey].income - weeks[weekKey].expense;
    weeks[weekKey].count += 1;
  }

  return Object.values(weeks)
    .map((w) => ({
      ...w,
      income: parseFloat(w.income.toFixed(2)),
      expense: parseFloat(w.expense.toFixed(2)),
      net: parseFloat(w.net.toFixed(2)),
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
};


export const getRecentActivity = async (
  userId: string,
  userRole: string,
  limit = 10
) => {
  const where = baseWhere(userId, userRole);

  const records = await prisma.financialRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return records;
};


export const getBalanceOverTime = async (userId: string, userRole: string) => {
  const where = baseWhere(userId, userRole);

  const records = await prisma.financialRecord.findMany({
    where,
    orderBy: { date: 'asc' },
    select: { amount: true, type: true, date: true, category: true },
  });

  let runningBalance = 0;

  const timeline = records.map((record) => {
    if (record.type === 'INCOME') {
      runningBalance += record.amount;
    } else {
      runningBalance -= record.amount;
    }
    return {
      date: record.date,
      category: record.category,
      type: record.type,
      amount: record.amount,
      balance: parseFloat(runningBalance.toFixed(2)),
    };
  });

  return {
    currentBalance: parseFloat(runningBalance.toFixed(2)),
    timeline,
  };
};


export const getTopCategories = async (
  userId: string,
  userRole: string,
  type: 'INCOME' | 'EXPENSE' = 'EXPENSE',
  limit = 5
) => {
  const where = baseWhere(userId, userRole);

  const records = await prisma.financialRecord.findMany({
    where: { ...where, type },
    select: { amount: true, category: true },
  });

  const totals: { [key: string]: number } = {};

  for (const record of records) {
    totals[record.category] = (totals[record.category] || 0) + record.amount;
  }

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total: parseFloat(total.toFixed(2)),
      type,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};