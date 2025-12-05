import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();

// @desc    Generate PDF financial report
// @route   GET /api/export/pdf-report
// @access  Private
export const generatePDFReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    // Fetch transactions for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "desc" },
    });

    // Fetch user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Calculate statistics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryStats: { [key: string]: number } = {};
    const monthlyStats: { [key: string]: { income: number; expense: number } } =
      {};

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    months.forEach((_, i) => {
      monthlyStats[i] = { income: 0, expense: 0 };
    });

    transactions.forEach((t) => {
      const monthIndex = new Date(t.date).getMonth();

      if (t.type === "INCOME") {
        totalIncome += t.amount;
        monthlyStats[monthIndex].income += t.amount;
      } else {
        totalExpense += t.amount;
        monthlyStats[monthIndex].expense += t.amount;
        categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
      }
    });

    const savings = totalIncome - totalExpense;

    // Create PDF
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=financial-report-${year}.pdf`
    );

    // Pipe to response
    doc.pipe(res);

    // Colors
    const primaryColor = "#8b5cf6";
    const successColor = "#22c55e";
    const dangerColor = "#ef4444";
    const textColor = "#374151";
    const mutedColor = "#6b7280";

    // Header
    doc
      .fillColor(primaryColor)
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("Financial Report", { align: "center" });

    doc
      .fillColor(mutedColor)
      .fontSize(14)
      .font("Helvetica")
      .text(`Year ${year}`, { align: "center" })
      .moveDown(0.5);

    doc
      .fillColor(textColor)
      .fontSize(12)
      .text(`Generated for: ${user?.name || "User"}`, { align: "center" })
      .text(
        `Date: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" }
      )
      .moveDown(2);

    // Summary Section
    doc
      .fillColor(textColor)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Annual Summary")
      .moveDown(0.5);

    // Draw summary boxes
    const summaryY = doc.y;
    const boxWidth = 160;
    const boxHeight = 60;
    const boxSpacing = 15;

    // Income Box
    doc
      .rect(50, summaryY, boxWidth, boxHeight)
      .fillAndStroke("#f0fdf4", successColor);
    doc
      .fillColor(successColor)
      .fontSize(10)
      .font("Helvetica")
      .text("Total Income", 60, summaryY + 10);
    doc
      .fillColor(textColor)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(`₹${totalIncome.toLocaleString("en-IN")}`, 60, summaryY + 30);

    // Expense Box
    doc
      .rect(50 + boxWidth + boxSpacing, summaryY, boxWidth, boxHeight)
      .fillAndStroke("#fef2f2", dangerColor);
    doc
      .fillColor(dangerColor)
      .fontSize(10)
      .font("Helvetica")
      .text("Total Expense", 60 + boxWidth + boxSpacing, summaryY + 10);
    doc
      .fillColor(textColor)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(
        `₹${totalExpense.toLocaleString("en-IN")}`,
        60 + boxWidth + boxSpacing,
        summaryY + 30
      );

    // Savings Box
    doc
      .rect(50 + (boxWidth + boxSpacing) * 2, summaryY, boxWidth, boxHeight)
      .fillAndStroke("#f5f3ff", primaryColor);
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font("Helvetica")
      .text("Net Savings", 60 + (boxWidth + boxSpacing) * 2, summaryY + 10);
    doc
      .fillColor(savings >= 0 ? successColor : dangerColor)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(
        `₹${savings.toLocaleString("en-IN")}`,
        60 + (boxWidth + boxSpacing) * 2,
        summaryY + 30
      );

    doc.y = summaryY + boxHeight + 30;

    // Monthly Breakdown
    doc
      .fillColor(textColor)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Monthly Breakdown")
      .moveDown(0.5);

    // Table Header
    const tableStartY = doc.y;
    const colWidths = [120, 120, 120, 120];

    doc.rect(50, tableStartY, 480, 25).fill("#f3f4f6");

    doc
      .fillColor(textColor)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Month", 60, tableStartY + 8)
      .text("Income", 180, tableStartY + 8)
      .text("Expense", 300, tableStartY + 8)
      .text("Savings", 420, tableStartY + 8);

    let rowY = tableStartY + 25;

    months.forEach((month, i) => {
      const stats = monthlyStats[i];
      const monthlySavings = stats.income - stats.expense;

      if (rowY > 750) {
        doc.addPage();
        rowY = 50;
      }

      const bgColor = i % 2 === 0 ? "#ffffff" : "#f9fafb";
      doc.rect(50, rowY, 480, 20).fill(bgColor);

      doc
        .fillColor(textColor)
        .fontSize(9)
        .font("Helvetica")
        .text(month, 60, rowY + 5)
        .text(`₹${stats.income.toLocaleString("en-IN")}`, 180, rowY + 5)
        .text(`₹${stats.expense.toLocaleString("en-IN")}`, 300, rowY + 5);

      doc
        .fillColor(monthlySavings >= 0 ? successColor : dangerColor)
        .text(`₹${monthlySavings.toLocaleString("en-IN")}`, 420, rowY + 5);

      rowY += 20;
    });

    // Category Breakdown
    doc.y = rowY + 20;

    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fillColor(textColor)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Expense by Category")
      .moveDown(0.5);

    const sortedCategories = Object.entries(categoryStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const categoryTableY = doc.y;

    doc.rect(50, categoryTableY, 400, 25).fill("#f3f4f6");

    doc
      .fillColor(textColor)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Category", 60, categoryTableY + 8)
      .text("Amount", 300, categoryTableY + 8)
      .text("%", 400, categoryTableY + 8);

    let catRowY = categoryTableY + 25;

    sortedCategories.forEach(([category, amount], i) => {
      const percentage = ((amount / totalExpense) * 100).toFixed(1);
      const bgColor = i % 2 === 0 ? "#ffffff" : "#f9fafb";

      doc.rect(50, catRowY, 400, 20).fill(bgColor);

      doc
        .fillColor(textColor)
        .fontSize(9)
        .font("Helvetica")
        .text(category, 60, catRowY + 5)
        .text(`₹${amount.toLocaleString("en-IN")}`, 300, catRowY + 5)
        .text(`${percentage}%`, 400, catRowY + 5);

      catRowY += 20;
    });

    // Footer
    doc
      .fillColor(mutedColor)
      .fontSize(8)
      .text(
        "This report was automatically generated by ExpenseAI",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate PDF report",
    });
  }
};
