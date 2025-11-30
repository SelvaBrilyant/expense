import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req: Request, res: Response) => {
  const { type, category, startDate, endDate } = req.query;

  const where: any = {
    userId: (req as any).user.id,
  };

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = category;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      items: true, // Include transaction items
    },
    orderBy: {
      date: 'desc',
    },
  });

  res.json(transactions);
};

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req: Request, res: Response) => {
  const { title, amount, type, category, paymentMethod, date, notes, tags, invoiceUrl, items } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      userId: (req as any).user.id,
      title,
      amount: parseFloat(amount),
      type,
      category,
      paymentMethod,
      date: new Date(date),
      notes,
      tags,
      invoiceUrl,
      items: items && items.length > 0 ? {
        create: items.map((item: any) => ({
          name: item.name,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
        })),
      } : undefined,
    },
    include: {
      items: true,
    },
  });

  res.status(201).json(transaction);
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, amount, type, category, paymentMethod, date, notes, tags, invoiceUrl, items } = req.body;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Delete existing items if updating with new items
  if (items !== undefined) {
    await prisma.transactionItem.deleteMany({
      where: { transactionId: id },
    });
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      title,
      amount: parseFloat(amount),
      type,
      category,
      paymentMethod,
      date: new Date(date),
      notes,
      tags,
      invoiceUrl,
      items: items && items.length > 0 ? {
        create: items.map((item: any) => ({
          name: item.name,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
        })),
      } : undefined,
    },
    include: {
      items: true,
    },
  });

  res.json(updatedTransaction);
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await prisma.transaction.delete({
    where: { id },
  });

  res.json({ message: 'Transaction removed' });
};
