import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, generateUserPrompt } from '../utils/aiPrompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async generateInsights(user: any, transactions: any[]) {
    try {
      const prompt = this.buildInsightsPrompt(user, transactions);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to mock insights if API fails
      return this.getMockInsights(user, transactions);
    }
  }

  async analyzeSpendingPatterns(transactions: any[], user: any) {
    try {
      const recentTransactions = transactions.slice(0, 50);
      const prompt = `Analyze the spending patterns for the following transactions and provide insights:
      
User Currency: ${user.currency}
Transactions: ${JSON.stringify(recentTransactions, null, 2)}

Please provide:
1. Top spending categories
2. Spending trends (increasing/decreasing)
3. Unusual spending patterns
4. Day of week analysis
5. Payment method preferences

Format your response in markdown.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Spending Analysis Error:', error);
      return 'Unable to analyze spending patterns at this time.';
    }
  }

  async detectOverspending(transactions: any[], budgets: any[], user: any) {
    try {
      const currentMonthExpenses = this.getCurrentMonthExpenses(transactions);
      
      const prompt = `Analyze overspending based on:
      
Current Month Expenses by Category: ${JSON.stringify(currentMonthExpenses, null, 2)}
Budgets: ${JSON.stringify(budgets, null, 2)}
Currency: ${user.currency}

Identify:
1. Categories exceeding budget
2. Projected overspending if current trend continues
3. Recommended actions to prevent overspending
4. Priority areas to cut back

Format your response in markdown with alerts and actionable items.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Overspending Detection Error:', error);
      return 'Unable to detect overspending at this time.';
    }
  }

  async getCategoryAdvice(category: string, transactions: any[], user: any) {
    try {
      const categoryTransactions = transactions.filter(
        (t) => t.category === category && t.type === 'EXPENSE'
      );

      const totalSpent = categoryTransactions.reduce((acc, t) => acc + t.amount, 0);
      const avgPerTransaction = totalSpent / categoryTransactions.length || 0;

      const prompt = `Provide financial advice for the category "${category}":

Total Spent: ${user.currency} ${totalSpent.toFixed(2)}
Number of Transactions: ${categoryTransactions.length}
Average per Transaction: ${user.currency} ${avgPerTransaction.toFixed(2)}
Recent Transactions: ${JSON.stringify(categoryTransactions.slice(0, 10), null, 2)}

Provide:
1. Is this spending reasonable?
2. Where can I save money in this category?
3. Smart alternatives or substitutes
4. Best practices for this category
5. Specific actionable tips

Format in markdown with emojis and actionable tips.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Category Advice Error:', error);
      return `Unable to provide advice for ${category} at this time.`;
    }
  }

  async getPersonalizedRecommendations(user: any, recentTransactions: any[]) {
    try {
      const totalIncome = recentTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = recentTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.amount, 0);

      const prompt = `As a financial advisor, provide personalized recommendations:

User Name: ${user.name || 'User'}
Currency: ${user.currency}
Recent Income: ${user.currency} ${totalIncome.toFixed(2)}
Recent Expenses: ${user.currency} ${totalExpense.toFixed(2)}
Savings Rate: ${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)}%

Recent Transactions: ${JSON.stringify(recentTransactions.slice(0, 20), null, 2)}

Provide:
1. Overall financial health assessment
2. Personalized savings goals
3. Investment recommendations based on spending
4. Emergency fund suggestions
5. 3 specific actionable steps to improve finances

Use encouraging tone, emojis, and format in markdown.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      return 'Unable to generate personalized recommendations at this time.';
    }
  }

  private buildInsightsPrompt(user: any, transactions: any[]): string {
    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    const topCategory = this.getTopCategory(transactions);
    const categoryBreakdown = this.getCategoryBreakdown(transactions);

    return `You are a financial advisor AI. Analyze these expense transactions and provide insights:

User Currency: ${user.currency}
Total Expenses: ${user.currency} ${totalExpense.toFixed(2)}
Number of Transactions: ${transactions.length}
Top Category: ${topCategory}

Category Breakdown:
${JSON.stringify(categoryBreakdown, null, 2)}

Recent Transactions (last 10):
${JSON.stringify(transactions.slice(0, 10), null, 2)}

Provide:
1. 📊 Spending Overview - Brief summary of total spending
2. 💡 Savings Opportunities - Where can they save money?
3. 🚀 Payment Analysis - UPI, Cash, Card usage patterns
4. ⚠️ Budget Alerts - Any concerning trends
5. 🎯 Actionable Tips - 3 specific steps to improve finances

Format your response in markdown with emojis. Be friendly and encouraging.`;
  }

  private getMockInsights(user: any, transactions: any[]): string {
    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    const topCategory = this.getTopCategory(transactions);

    return `
# 🤖 AI Financial Insights

## 📊 Spending Overview
You have spent **${user.currency} ${totalExpense.toFixed(2)}** recently. 
Your highest spending category is **${topCategory}**.

## 💡 Savings Opportunities
- **Dining Out**: Consider cooking at home more often
- **Subscriptions**: Review your recurring payments

## 🚀 Payment Analysis
- You use UPI frequently for small payments
- **Tip**: Try to consolidate small expenses

## ⚠️ Budget Alert
- Monitor your spending in **${topCategory}**

## 🎯 Actionable Tips
1. Set a monthly budget for top categories
2. Track daily expenses more carefully
3. Review subscriptions quarterly

*AI insights powered by Gemini*
    `;
  }

  private getTopCategory(transactions: any[]): string {
    const categories: any = {};
    transactions.forEach((t) => {
      if (t.type === 'EXPENSE') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return Object.keys(categories).reduce(
      (a, b) => (categories[a] > categories[b] ? a : b),
      'None'
    );
  }

  private getCategoryBreakdown(transactions: any[]) {
    const categories: any = {};
    transactions.forEach((t) => {
      if (t.type === 'EXPENSE') {
        if (!categories[t.category]) {
          categories[t.category] = { total: 0, count: 0 };
        }
        categories[t.category].total += t.amount;
        categories[t.category].count += 1;
      }
    });
    return categories;
  }

  private getCurrentMonthExpenses(transactions: any[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses: any = {};
    transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'EXPENSE' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      })
      .forEach((t) => {
        monthlyExpenses[t.category] = (monthlyExpenses[t.category] || 0) + t.amount;
      });

    return monthlyExpenses;
  }
}

export const aiService = new AIService();

