import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const processRecurringTransactions = async () => {
  console.log('Running recurring transaction check...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: today,
        },
      },
    });

    for (const rt of recurringTransactions) {
      try {
        let nextDate = new Date(rt.nextDueDate);
        
        // Process all missed occurrences up to today
        while (nextDate <= today) {
          // Add transaction
          await prisma.transaction.create({
            data: {
              userId: rt.userId,
              title: rt.title,
              amount: rt.amount,
              type: rt.type,
              category: rt.category,
              paymentMethod: rt.paymentMethod,
              date: nextDate, // Use the actual due date
              notes: 'Auto-generated recurring payment',
              isRecurring: true,
            },
          });

          // Calculate next due date
          if (rt.frequency === 'DAILY') nextDate.setDate(nextDate.getDate() + 1);
          if (rt.frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
          if (rt.frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
          if (rt.frequency === 'YEARLY') nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        // Update next due date in DB
        await prisma.recurringTransaction.update({
          where: { id: rt.id },
          data: { nextDueDate: nextDate },
        });
      } catch (error) {
        console.error(`Failed to process recurring transaction ${rt.id}:`, error);
      }
    }

    console.log(`Processed ${recurringTransactions.length} recurring transactions.`);
  } catch (error) {
    console.error('Error running recurring transaction job:', error);
  }
};

export const initCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    await processRecurringTransactions();
  });
};
