import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const processRecurringTransactions = async () => {
  console.log('Running recurring transaction check...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

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
          // Check if we should create transaction on this day
          let shouldCreate = true;
          
          // If daysOfWeek is specified and not empty, check if today matches
          if (rt.daysOfWeek && rt.daysOfWeek.length > 0) {
            const currentDayOfWeek = nextDate.getDay();
            shouldCreate = rt.daysOfWeek.includes(currentDayOfWeek);
          }

          // Create transaction only if it matches the day criteria
          if (shouldCreate) {
            await prisma.transaction.create({
              data: {
                userId: rt.userId,
                title: rt.title,
                amount: rt.amount,
                type: rt.type,
                category: rt.category,
                paymentMethod: rt.paymentMethod,
                date: nextDate,
                notes: `Auto-generated from recurring: ${rt.frequency}`,
                isRecurring: true,
              },
            });
            console.log(`Created transaction for ${rt.title} on ${nextDate.toDateString()}`);
          }

          // Calculate next due date based on frequency
          const tempDate = new Date(nextDate);
          if (rt.frequency === 'DAILY') {
            tempDate.setDate(tempDate.getDate() + 1);
          } else if (rt.frequency === 'WEEKLY') {
            tempDate.setDate(tempDate.getDate() + 7);
          } else if (rt.frequency === 'MONTHLY') {
            tempDate.setMonth(tempDate.getMonth() + 1);
          } else if (rt.frequency === 'YEARLY') {
            tempDate.setFullYear(tempDate.getFullYear() + 1);
          }
          nextDate = tempDate;
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
