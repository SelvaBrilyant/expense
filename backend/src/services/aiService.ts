import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, generateUserPrompt } from "../utils/aiPrompts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export class AIService {
  async generateInsights(user: any, transactions: any[]) {
    try {
      const prompt = this.buildInsightsPrompt(user, transactions);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Service Error:", error);
      // Fallback to mock insights if API fails
      return this.getMockInsights(user, transactions);
    }
  }

  async chatWithAdvisor(message: string, context: any) {
    try {
      const { user, transactions, budgets } = context;

      const contextData = {
        totalExpenses: transactions
          .filter((t: any) => t.type === "EXPENSE")
          .reduce((acc: number, t: any) => acc + t.amount, 0),
        totalIncome: transactions
          .filter((t: any) => t.type === "INCOME")
          .reduce((acc: number, t: any) => acc + t.amount, 0),
        topCategory: this.getTopCategory(transactions),
        budgetCount: budgets?.length || 0,
        transactionCount: transactions.length,
      };

      const prompt = `You are a helpful financial advisor AI assistant. The user has asked: "${message}"

Context about the user's finances:
- Currency: ${user.currency}
- Total Expenses: ${user.currency} ${contextData.totalExpenses.toFixed(2)}
- Total Income: ${user.currency} ${contextData.totalIncome.toFixed(2)}
- Top Spending Category: ${contextData.topCategory}
- Active Budgets: ${contextData.budgetCount}
- Recent Transactions: ${contextData.transactionCount}

Recent transaction samples:
${JSON.stringify(transactions.slice(0, 10), null, 2)}

Provide a helpful, friendly, and actionable response. Use emojis and markdown formatting. Be specific and reference their actual data when possible.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "I'm having trouble connecting right now. Please try again in a moment! 🔄";
    }
  }

  async getWeeklyReport(user: any, transactions: any[], budgets: any[]) {
    try {
      const expenses = transactions.filter((t) => t.type === "EXPENSE");
      const income = transactions.filter((t) => t.type === "INCOME");

      const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
      const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
      const categoryBreakdown = this.getCategoryBreakdown(transactions);

      const prompt = `Generate a comprehensive weekly financial report:

User: ${user.name || "User"}
Currency: ${user.currency}
Period: Last 7 Days

Summary:
- Total Income: ${user.currency} ${totalIncome.toFixed(2)}
- Total Expenses: ${user.currency} ${totalExpenses.toFixed(2)}
- Net Savings: ${user.currency} ${(totalIncome - totalExpenses).toFixed(2)}
- Transaction Count: ${transactions.length}

Category Breakdown:
${JSON.stringify(categoryBreakdown, null, 2)}

Budgets:
${JSON.stringify(budgets, null, 2)}

Recent Transactions:
${JSON.stringify(transactions.slice(0, 20), null, 2)}

Provide a detailed weekly report with:
1. 📊 **Weekly Summary** - Key highlights and metrics
2. 💰 **Income vs Expenses** - Analysis of cash flow
3. 📈 **Top Categories** - Where money was spent
4. ⚠️ **Budget Alerts** - Any budget concerns
5. 🎯 **Action Items** - Specific recommendations for next week
6. 🏆 **Wins** - Positive financial behaviors to celebrate

Use markdown, emojis, and be encouraging. Format as a professional report.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Weekly Report Error:", error);
      return "📊 Unable to generate weekly report at this time.";
    }
  }

  async predictFutureSpending(user: any, transactions: any[]) {
    try {
      const monthlyData = this.getMonthlyAverages(transactions);
      const categoryTrends = this.getCategoryTrends(transactions);

      const prompt = `Analyze spending patterns and predict next month's expenses:

User Currency: ${user.currency}

Monthly Averages (last 3 months):
${JSON.stringify(monthlyData, null, 2)}

Category Trends:
${JSON.stringify(categoryTrends, null, 2)}

Transaction History:
${JSON.stringify(transactions.slice(0, 50), null, 2)}

Provide:
1. 🔮 **Next Month Forecast** - Predicted total spending
2. 📊 **Category-wise Predictions** - Expected spending per category
3. 📈 **Trend Analysis** - Increasing/decreasing patterns
4. ⚠️ **Potential Overspending** - Categories to watch
5. 💡 **Recommendations** - How to optimize next month's budget

Use data-driven insights and provide specific numbers. Format in markdown with charts/tables if helpful.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Forecast Error:", error);
      return "🔮 Unable to generate forecast at this time.";
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Spending Analysis Error:", error);
      return "Unable to analyze spending patterns at this time.";
    }
  }

  async detectOverspending(transactions: any[], budgets: any[], user: any) {
    try {
      const currentMonthExpenses = this.getCurrentMonthExpenses(transactions);

      const prompt = `Analyze overspending based on:
      
Current Month Expenses by Category: ${JSON.stringify(
        currentMonthExpenses,
        null,
        2
      )}
Budgets: ${JSON.stringify(budgets, null, 2)}
Currency: ${user.currency}

Identify:
1. Categories exceeding budget
2. Projected overspending if current trend continues
3. Recommended actions to prevent overspending
4. Priority areas to cut back

Format your response in markdown with alerts and actionable items.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Overspending Detection Error:", error);
      return "Unable to detect overspending at this time.";
    }
  }

  async getCategoryAdvice(category: string, transactions: any[], user: any) {
    try {
      const categoryTransactions = transactions.filter(
        (t) => t.category === category && t.type === "EXPENSE"
      );

      const totalSpent = categoryTransactions.reduce(
        (acc, t) => acc + t.amount,
        0
      );
      const avgPerTransaction = totalSpent / categoryTransactions.length || 0;

      const prompt = `Provide financial advice for the category "${category}":

Total Spent: ${user.currency} ${totalSpent.toFixed(2)}
Number of Transactions: ${categoryTransactions.length}
Average per Transaction: ${user.currency} ${avgPerTransaction.toFixed(2)}
Recent Transactions: ${JSON.stringify(
        categoryTransactions.slice(0, 10),
        null,
        2
      )}

Provide:
1. Is this spending reasonable?
2. Where can I save money in this category?
3. Smart alternatives or substitutes
4. Best practices for this category
5. Specific actionable tips

Format in markdown with emojis and actionable tips.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Category Advice Error:", error);
      return `Unable to provide advice for ${category} at this time.`;
    }
  }

  async getPersonalizedRecommendations(user: any, recentTransactions: any[]) {
    try {
      const totalIncome = recentTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = recentTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc, t) => acc + t.amount, 0);

      const prompt = `As a financial advisor, provide personalized recommendations:

User Name: ${user.name || "User"}
Currency: ${user.currency}
Recent Income: ${user.currency} ${totalIncome.toFixed(2)}
Recent Expenses: ${user.currency} ${totalExpense.toFixed(2)}
Savings Rate: ${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(
        1
      )}%

Recent Transactions: ${JSON.stringify(recentTransactions.slice(0, 20), null, 2)}

Provide:
1. Overall financial health assessment
2. Personalized savings goals
3. Investment recommendations based on spending
4. Emergency fund suggestions
5. 3 specific actionable steps to improve finances

Use encouraging tone, emojis, and format in markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Recommendations Error:", error);
      return "Unable to generate personalized recommendations at this time.";
    }
  }

  private buildInsightsPrompt(user: any, transactions: any[]): string {
    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
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
      .filter((t) => t.type === "EXPENSE")
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
      if (t.type === "EXPENSE") {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return Object.keys(categories).reduce(
      (a, b) => (categories[a] > categories[b] ? a : b),
      "None"
    );
  }

  private getCategoryBreakdown(transactions: any[]) {
    const categories: any = {};
    transactions.forEach((t) => {
      if (t.type === "EXPENSE") {
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
          t.type === "EXPENSE" &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      })
      .forEach((t) => {
        monthlyExpenses[t.category] =
          (monthlyExpenses[t.category] || 0) + t.amount;
      });

    return monthlyExpenses;
  }

  private getMonthlyAverages(transactions: any[]) {
    const months: any = {};
    transactions.forEach((t) => {
      if (t.type === "EXPENSE") {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!months[monthKey]) months[monthKey] = 0;
        months[monthKey] += t.amount;
      }
    });
    return months;
  }

  private getCategoryTrends(transactions: any[]) {
    const trends: any = {};
    transactions.forEach((t) => {
      if (t.type === "EXPENSE") {
        if (!trends[t.category]) trends[t.category] = [];
        trends[t.category].push({ date: t.date, amount: t.amount });
      }
    });
    return trends;
  }

  async parseInvoice(
    imageBase64: string,
    mimeType: string
  ): Promise<{
    success: boolean;
    data?: {
      title: string;
      amount: number;
      date: string;
      category: string;
      type: "INCOME" | "EXPENSE";
      paymentMethod: string;
      notes: string;
      items: Array<{ name: string; quantity: number; price: number }>;
    };
    error?: string;
  }> {
    try {
      const prompt = `Analyze this invoice/receipt image and extract the following information in JSON format:

{
  "title": "Brief description of the purchase (e.g., 'Grocery Shopping at BigBazaar')",
  "amount": <total amount as a number without currency symbol>,
  "date": "YYYY-MM-DD format (use today's date if not visible)",
  "category": "<one of: Food, Travel, Groceries, Entertainment, Shopping, Bills, Investments, Loans, UPI Payments, Others>",
  "type": "EXPENSE",
  "paymentMethod": "<one of: CASH, CARD, UPI, WALLET, NET_BANKING, OTHER>",
  "notes": "Additional details like store name, address, invoice number if available",
  "items": [
    { "name": "Item name", "quantity": <number>, "price": <item price as number> }
  ]
}

Instructions:
1. Extract ALL line items from the invoice if visible
2. The 'amount' should be the final total/grand total
3. Determine the category based on the items purchased
4. Detect payment method from the invoice if mentioned (UPI, Card, Cash, etc.)
5. If date is not visible, use today's date: ${
        new Date().toISOString().split("T")[0]
      }
6. For items, calculate price per unit if only total is shown
7. Return ONLY valid JSON, no additional text

If you cannot read the invoice clearly, still provide your best estimate with available information.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const responseText = response.text || "";

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Clean up the string - remove any trailing commas before closing brackets
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");

      const parsedData = JSON.parse(jsonStr);

      // Validate and sanitize the parsed data
      const validCategories = [
        "Food",
        "Travel",
        "Groceries",
        "Entertainment",
        "Shopping",
        "Bills",
        "Investments",
        "Loans",
        "UPI Payments",
        "Others",
      ];
      const validPaymentMethods = [
        "CASH",
        "CARD",
        "UPI",
        "WALLET",
        "NET_BANKING",
        "OTHER",
      ];

      return {
        success: true,
        data: {
          title: parsedData.title || "Invoice Purchase",
          amount: Math.abs(parseFloat(parsedData.amount)) || 0,
          date: parsedData.date || new Date().toISOString().split("T")[0],
          category: validCategories.includes(parsedData.category)
            ? parsedData.category
            : "Others",
          type: parsedData.type === "INCOME" ? "INCOME" : "EXPENSE",
          paymentMethod: validPaymentMethods.includes(parsedData.paymentMethod)
            ? parsedData.paymentMethod
            : "OTHER",
          notes: parsedData.notes || "",
          items: Array.isArray(parsedData.items)
            ? parsedData.items.map((item: any) => ({
                name: item.name || "Item",
                quantity: parseFloat(item.quantity) || 1,
                price: parseFloat(item.price) || 0,
              }))
            : [],
        },
      };
    } catch (error: any) {
      console.error("Invoice parsing error:", error);
      return {
        success: false,
        error:
          error.message ||
          "Failed to parse invoice. Please try again or enter details manually.",
      };
    }
  }

  async suggestCategory(
    title: string,
    type: "INCOME" | "EXPENSE"
  ): Promise<{
    category: string;
    confidence: number;
    reason: string;
  }> {
    const lowerTitle = title.toLowerCase();

    // Fast keyword-based matching for common patterns
    if (type === "INCOME") {
      if (lowerTitle.includes("salary") || lowerTitle.includes("payroll")) {
        return {
          category: "Salary",
          confidence: 0.95,
          reason: "Salary keyword detected",
        };
      }
      if (
        lowerTitle.includes("freelance") ||
        lowerTitle.includes("project") ||
        lowerTitle.includes("client")
      ) {
        return {
          category: "Freelance",
          confidence: 0.85,
          reason: "Freelance keyword detected",
        };
      }
      if (lowerTitle.includes("refund") || lowerTitle.includes("return")) {
        return {
          category: "Refund",
          confidence: 0.9,
          reason: "Refund keyword detected",
        };
      }
      if (lowerTitle.includes("gift") || lowerTitle.includes("birthday")) {
        return {
          category: "Gift",
          confidence: 0.85,
          reason: "Gift keyword detected",
        };
      }
      if (
        lowerTitle.includes("dividend") ||
        lowerTitle.includes("interest") ||
        lowerTitle.includes("stock")
      ) {
        return {
          category: "Investments",
          confidence: 0.9,
          reason: "Investment keyword detected",
        };
      }
      if (lowerTitle.includes("rent")) {
        return {
          category: "Rental",
          confidence: 0.9,
          reason: "Rental keyword detected",
        };
      }
      return {
        category: "Other",
        confidence: 0.5,
        reason: "No specific pattern detected",
      };
    }

    // Expense categories
    if (
      lowerTitle.includes("uber") ||
      lowerTitle.includes("ola") ||
      lowerTitle.includes("cab") ||
      lowerTitle.includes("metro") ||
      lowerTitle.includes("train") ||
      lowerTitle.includes("flight") ||
      lowerTitle.includes("bus")
    ) {
      return {
        category: "Travel",
        confidence: 0.95,
        reason: "Travel keyword detected",
      };
    }
    if (
      lowerTitle.includes("swiggy") ||
      lowerTitle.includes("zomato") ||
      lowerTitle.includes("restaurant") ||
      lowerTitle.includes("cafe") ||
      lowerTitle.includes("food") ||
      lowerTitle.includes("lunch") ||
      lowerTitle.includes("dinner") ||
      lowerTitle.includes("breakfast")
    ) {
      return {
        category: "Food",
        confidence: 0.95,
        reason: "Food keyword detected",
      };
    }
    if (
      lowerTitle.includes("grocery") ||
      lowerTitle.includes("bigbasket") ||
      lowerTitle.includes("dmart") ||
      lowerTitle.includes("vegetables") ||
      lowerTitle.includes("fruits") ||
      lowerTitle.includes("supermarket")
    ) {
      return {
        category: "Groceries",
        confidence: 0.95,
        reason: "Grocery keyword detected",
      };
    }
    if (
      lowerTitle.includes("amazon") ||
      lowerTitle.includes("flipkart") ||
      lowerTitle.includes("myntra") ||
      lowerTitle.includes("shopping") ||
      lowerTitle.includes("clothes")
    ) {
      return {
        category: "Shopping",
        confidence: 0.9,
        reason: "Shopping keyword detected",
      };
    }
    if (
      lowerTitle.includes("netflix") ||
      lowerTitle.includes("prime") ||
      lowerTitle.includes("movie") ||
      lowerTitle.includes("game") ||
      lowerTitle.includes("spotify") ||
      lowerTitle.includes("hotstar")
    ) {
      return {
        category: "Entertainment",
        confidence: 0.95,
        reason: "Entertainment keyword detected",
      };
    }
    if (
      lowerTitle.includes("electricity") ||
      lowerTitle.includes("water") ||
      lowerTitle.includes("gas") ||
      lowerTitle.includes("wifi") ||
      lowerTitle.includes("mobile") ||
      lowerTitle.includes("recharge") ||
      lowerTitle.includes("bill")
    ) {
      return {
        category: "Bills",
        confidence: 0.95,
        reason: "Bill keyword detected",
      };
    }
    if (lowerTitle.includes("emi") || lowerTitle.includes("loan")) {
      return {
        category: "Loans",
        confidence: 0.95,
        reason: "Loan keyword detected",
      };
    }
    if (
      lowerTitle.includes("mutual fund") ||
      lowerTitle.includes("sip") ||
      lowerTitle.includes("stock") ||
      lowerTitle.includes("investment")
    ) {
      return {
        category: "Investments",
        confidence: 0.9,
        reason: "Investment keyword detected",
      };
    }
    if (
      lowerTitle.includes("upi") ||
      lowerTitle.includes("gpay") ||
      lowerTitle.includes("phonepe") ||
      lowerTitle.includes("paytm")
    ) {
      return {
        category: "UPI Payments",
        confidence: 0.7,
        reason: "UPI keyword detected",
      };
    }

    return {
      category: "Others",
      confidence: 0.5,
      reason: "No specific pattern detected",
    };
  }

  async predictSpending(transactions: any[]): Promise<{
    predictions: Array<{
      category: string;
      predictedAmount: number;
      trend: "up" | "down" | "stable";
      confidence: number;
      reason: string;
    }>;
    totalPredicted: number;
    insights: string[];
  }> {
    // Group transactions by month and category
    const monthlySpending: { [month: string]: { [category: string]: number } } =
      {};

    transactions.forEach((t) => {
      if (t.type === "EXPENSE") {
        const monthKey = new Date(t.date).toISOString().slice(0, 7);
        if (!monthlySpending[monthKey]) {
          monthlySpending[monthKey] = {};
        }
        monthlySpending[monthKey][t.category] =
          (monthlySpending[monthKey][t.category] || 0) + t.amount;
      }
    });

    const sortedMonths = Object.keys(monthlySpending).sort();
    const predictions: Array<{
      category: string;
      predictedAmount: number;
      trend: "up" | "down" | "stable";
      confidence: number;
      reason: string;
    }> = [];

    // Get all unique categories
    const categories = new Set<string>();
    Object.values(monthlySpending).forEach((monthData) => {
      Object.keys(monthData).forEach((cat) => categories.add(cat));
    });

    // Calculate predictions for each category
    categories.forEach((category) => {
      const categorySpending = sortedMonths.map(
        (month) => monthlySpending[month][category] || 0
      );

      const recentMonths = categorySpending.slice(-3);
      const avg = recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length;

      // Calculate trend
      let trend: "up" | "down" | "stable" = "stable";
      let trendReason = "Spending is relatively stable";

      if (recentMonths.length >= 2) {
        const recentAvg =
          (recentMonths[recentMonths.length - 1] +
            recentMonths[recentMonths.length - 2]) /
          2;
        const olderAvg = recentMonths[0];

        if (recentAvg > olderAvg * 1.15) {
          trend = "up";
          trendReason = `Spending has increased by ${Math.round(
            ((recentAvg - olderAvg) / olderAvg) * 100
          )}%`;
        } else if (recentAvg < olderAvg * 0.85) {
          trend = "down";
          trendReason = `Spending has decreased by ${Math.round(
            ((olderAvg - recentAvg) / olderAvg) * 100
          )}%`;
        }
      }

      // Apply trend to prediction
      let predictedAmount = avg;
      if (trend === "up") {
        predictedAmount = avg * 1.1;
      } else if (trend === "down") {
        predictedAmount = avg * 0.9;
      }

      // Confidence based on data consistency
      const variance =
        recentMonths.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        recentMonths.length;
      const stdDev = Math.sqrt(variance);
      const cv = avg > 0 ? stdDev / avg : 0;
      const confidence = Math.max(0.3, Math.min(0.95, 1 - cv));

      if (avg > 0) {
        predictions.push({
          category,
          predictedAmount: Math.round(predictedAmount),
          trend,
          confidence: Math.round(confidence * 100) / 100,
          reason: trendReason,
        });
      }
    });

    // Sort by predicted amount
    predictions.sort((a, b) => b.predictedAmount - a.predictedAmount);

    const totalPredicted = predictions.reduce(
      (sum, p) => sum + p.predictedAmount,
      0
    );

    // Generate insights
    const insights: string[] = [];

    const topSpending = predictions[0];
    if (topSpending) {
      insights.push(
        `Your highest predicted expense is ${
          topSpending.category
        } at ₹${topSpending.predictedAmount.toLocaleString()}`
      );
    }

    const increasingCategories = predictions.filter((p) => p.trend === "up");
    if (increasingCategories.length > 0) {
      insights.push(
        `Watch out: ${increasingCategories.map((c) => c.category).join(", ")} ${
          increasingCategories.length === 1 ? "is" : "are"
        } showing an upward trend`
      );
    }

    const decreasingCategories = predictions.filter((p) => p.trend === "down");
    if (decreasingCategories.length > 0) {
      insights.push(
        `Good progress: ${decreasingCategories
          .map((c) => c.category)
          .join(", ")} spending is decreasing`
      );
    }

    insights.push(
      `Total predicted spending for next month: ₹${totalPredicted.toLocaleString()}`
    );

    return {
      predictions: predictions.slice(0, 10),
      totalPredicted,
      insights,
    };
  }
}

export const aiService = new AIService();
