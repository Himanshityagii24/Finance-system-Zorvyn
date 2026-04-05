import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors';
import { UpdateUserInput, UpdateRoleInput, GetUsersQuery } from './users.schema';

// Always strip password before returning user
const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string;
}) => {
  const { passwordHash: _, ...safe } = user;
  return safe;
};

export const getAllUsers = async (query: GetUsersQuery) => {
  const { page, limit, role, isActive, search } = query;
  const skip = (page - 1) * limit;

  // Build dynamic filter
  const where: Record<string, unknown> = {};

  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;

  // Search by name or email
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
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

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // also return count of their records
      _count: {
        select: { records: true },
      },
    },
  });

  if (!user) throw new NotFoundError('User');
  return user;
};

export const updateUser = async (
  targetId: string,
  requesterId: string,
  input: UpdateUserInput
) => {
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new NotFoundError('User');

  // Check email uniqueness if changing email
  if (input.email && input.email !== user.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (emailTaken) throw new ConflictError('Email already in use');
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
};

export const updateUserRole = async (
  targetId: string,
  requesterId: string,
  input: UpdateRoleInput
) => {
  // Prevent admin from changing their own role accidentally
  if (targetId === requesterId) {
    throw new ForbiddenError('You cannot change your own role');
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: input.role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
};

export const toggleUserStatus = async (
  targetId: string,
  requesterId: string
) => {
  // Admin cannot deactivate themselves
  if (targetId === requesterId) {
    throw new ForbiddenError('You cannot deactivate your own account');
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
};

export const deleteUser = async (targetId: string, requesterId: string) => {
  if (targetId === requesterId) {
    throw new ForbiddenError('You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new NotFoundError('User');

  await prisma.user.delete({ where: { id: targetId } });

  return { message: 'User deleted successfully' };
};