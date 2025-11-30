import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

// @desc    Export dashboard data with pivot tables
// @route   GET /api/export/dashboard
// @access  Private
export const exportDashboard = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  // Fetch all transactions for the user
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Raw Transactions
  const transactionsSheet = workbook.addWorksheet('Transactions');
  transactionsSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  transactions.forEach((t) => {
    transactionsSheet.addRow({
      date: new Date(t.date).toLocaleDateString(),
      title: t.title,
      type: t.type,
      category: t.category,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      notes: t.notes || '',
    });
  });

  // Format amount column as currency
  transactionsSheet.getColumn('amount').numFmt = '₹#,##0.00';

  // Sheet 2: Category vs Amount Pivot
  const categoryPivot = workbook.addWorksheet('Category Pivot');
  categoryPivot.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Total Amount', key: 'amount', width: 15 },
    { header: 'Transaction Count', key: 'count', width: 18 },
  ];

  // Calculate category totals
  const categoryData: { [key: string]: { amount: number; count: number } } = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = { amount: 0, count: 0 };
      }
      categoryData[t.category].amount += t.amount;
      categoryData[t.category].count += 1;
    });

  Object.entries(categoryData)
    .sort((a, b) => b[1].amount - a[1].amount)
    .forEach(([category, data]) => {
      categoryPivot.addRow({
        category,
        amount: data.amount,
        count: data.count,
      });
    });

  categoryPivot.getColumn('amount').numFmt = '₹#,##0.00';

  // Sheet 3: Month vs Total Expense Pivot
  const monthPivot = workbook.addWorksheet('Monthly Pivot');
  monthPivot.columns = [
    { header: 'Month', key: 'month', width: 15 },
    { header: 'Total Income', key: 'income', width: 15 },
    { header: 'Total Expense', key: 'expense', width: 15 },
    { header: 'Net', key: 'net', width: 15 },
  ];

  // Calculate monthly totals
  const monthData: { [key: string]: { income: number; expense: number } } = {};
  transactions.forEach((t) => {
    const monthKey = new Date(t.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
    if (!monthData[monthKey]) {
      monthData[monthKey] = { income: 0, expense: 0 };
    }
    if (t.type === 'INCOME') {
      monthData[monthKey].income += t.amount;
    } else {
      monthData[monthKey].expense += t.amount;
    }
  });

  Object.entries(monthData).forEach(([month, data]) => {
    monthPivot.addRow({
      month,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    });
  });

  monthPivot.getColumn('income').numFmt = '₹#,##0.00';
  monthPivot.getColumn('expense').numFmt = '₹#,##0.00';
  monthPivot.getColumn('net').numFmt = '₹#,##0.00';

  // Style headers
  [transactionsSheet, categoryPivot, monthPivot].forEach((sheet) => {
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A5568' },
    };
    sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
  });

  // Generate buffer and send
  const buffer = await workbook.xlsx.writeBuffer();
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=dashboard-export.xlsx');
  res.send(buffer);
};

// @desc    Export all transactions
// @route   GET /api/export/transactions
// @access  Private
export const exportTransactions = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Transactions');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Location', key: 'location', width: 20 },
  ];

  transactions.forEach((t) => {
    sheet.addRow({
      date: new Date(t.date).toLocaleDateString(),
      title: t.title,
      type: t.type,
      category: t.category,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      notes: t.notes || '',
      location: t.location || '',
    });
  });

  sheet.getColumn('amount').numFmt = '₹#,##0.00';
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A5568' },
  };
  sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions-export.xlsx');
  res.send(buffer);
};

// @desc    Export category summary
// @route   GET /api/export/categories
// @access  Private
export const exportCategories = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE' },
  });

  const categoryData: { [key: string]: { amount: number; count: number } } = {};
  transactions.forEach((t) => {
    if (!categoryData[t.category]) {
      categoryData[t.category] = { amount: 0, count: 0 };
    }
    categoryData[t.category].amount += t.amount;
    categoryData[t.category].count += 1;
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Category Summary');

  sheet.columns = [
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Total Amount', key: 'amount', width: 15 },
    { header: 'Transaction Count', key: 'count', width: 18 },
    { header: 'Average', key: 'average', width: 15 },
  ];

  Object.entries(categoryData)
    .sort((a, b) => b[1].amount - a[1].amount)
    .forEach(([category, data]) => {
      sheet.addRow({
        category,
        amount: data.amount,
        count: data.count,
        average: data.amount / data.count,
      });
    });

  sheet.getColumn('amount').numFmt = '₹#,##0.00';
  sheet.getColumn('average').numFmt = '₹#,##0.00';
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A5568' },
  };
  sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=categories-export.xlsx');
  res.send(buffer);
};
