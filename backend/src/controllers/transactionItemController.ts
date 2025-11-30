import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all items for a transaction
// @route   GET /api/transactions/:transactionId/items
// @access  Private
export const getTransactionItems = async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  // Verify transaction exists and belongs to user
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const items = await prisma.transactionItem.findMany({
    where: { transactionId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(items);
};

// @desc    Add item to transaction
// @route   POST /api/transactions/:transactionId/items
// @access  Private
export const addTransactionItem = async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const { name, quantity, price } = req.body;

  // Verify transaction exists and belongs to user
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const item = await prisma.transactionItem.create({
    data: {
      transactionId,
      name,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
    },
  });

  res.status(201).json(item);
};

// @desc    Update transaction item
// @route   PUT /api/transactions/:transactionId/items/:id
// @access  Private
export const updateTransactionItem = async (req: Request, res: Response) => {
  const { transactionId, id } = req.params;
  const { name, quantity, price } = req.body;

  // Verify transaction exists and belongs to user
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const item = await prisma.transactionItem.findUnique({
    where: { id },
  });

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  const updatedItem = await prisma.transactionItem.update({
    where: { id },
    data: {
      name,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
    },
  });

  res.json(updatedItem);
};

// @desc    Delete transaction item
// @route   DELETE /api/transactions/:transactionId/items/:id
// @access  Private
export const deleteTransactionItem = async (req: Request, res: Response) => {
  const { transactionId, id } = req.params;

  // Verify transaction exists and belongs to user
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.userId !== (req as any).user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const item = await prisma.transactionItem.findUnique({
    where: { id },
  });

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  await prisma.transactionItem.delete({
    where: { id },
  });

  res.json({ message: 'Item removed' });
};
