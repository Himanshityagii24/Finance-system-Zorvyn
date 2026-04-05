import { prisma } from '../../config/prisma';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { CreateRecordInput, UpdateRecordInput, GetRecordsQuery } from './records.schema';

export const createRecord = async (input: CreateRecordInput, userId: string) => {
  const record = await prisma.financialRecord.create({
    data: {
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      notes: input.notes,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return record;
};

export const getAllRecords = async (query: GetRecordsQuery, userId: string, userRole: string) => {
  const { page, limit, type, category, search, from, to, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const where: Record<string, unknown> = {
    isDeleted: false, // never return soft deleted records
  };

  // VIEWER and ANALYST can only see their own records
  // ADMIN can see all records
  if (userRole !== 'ADMIN') {
    where.createdById = userId;
  }

  if (type) where.type = type;

  if (category) {
    where.category = { contains: category };
  }

  // Search in notes or category
  if (search) {
    where.OR = [
      { category: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  // Date range filter
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return {
    records,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const getRecordById = async (id: string, userId: string, userRole: string) => {
  const record = await prisma.financialRecord.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!record || record.isDeleted) throw new NotFoundError('Record');

  // Non-admin can only view their own records
  if (userRole !== 'ADMIN' && record.createdById !== userId) {
    throw new ForbiddenError('You can only view your own records');
  }

  return record;
};

export const updateRecord = async (
  id: string,
  input: UpdateRecordInput,
  userId: string,
  userRole: string
) => {
  const record = await prisma.financialRecord.findUnique({ where: { id } });

  if (!record || record.isDeleted) throw new NotFoundError('Record');

  // Only admin can update any record
  // Analyst can only update their own
  if (userRole !== 'ADMIN' && record.createdById !== userId) {
    throw new ForbiddenError('You can only update your own records');
  }

  const updated = await prisma.financialRecord.update({
    where: { id },
    data: {
      ...input,
      ...(input.date ? { date: new Date(input.date) } : {}),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updated;
};

export const deleteRecord = async (id: string, userId: string, userRole: string) => {
  const record = await prisma.financialRecord.findUnique({ where: { id } });

  if (!record || record.isDeleted) throw new NotFoundError('Record');

  // Only admin can delete any record
  if (userRole !== 'ADMIN' && record.createdById !== userId) {
    throw new ForbiddenError('You can only delete your own records');
  }

  // Soft delete — just mark isDeleted = true, never remove from DB
  await prisma.financialRecord.update({
    where: { id },
    data: { isDeleted: true },
  });

  return { message: 'Record deleted successfully' };
};