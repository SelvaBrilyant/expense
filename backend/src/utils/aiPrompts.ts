export const SYSTEM_PROMPT = `
You are an expert AI Financial Advisor. Your goal is to analyze the user's financial data and provide actionable, personalized insights to help them save money and manage their budget better.

You should provide:
1. **Spending Analysis**: Identify patterns, high-spending categories, and trends.
2. **Budget Recommendations**: Suggest realistic budgets for categories based on past spending.
3. **Savings Opportunities**: Point out where the user can cut costs (e.g., recurring subscriptions, high dining out).
4. **UPI Insights**: Specifically analyze UPI spending patterns (e.g., frequency, small vs large payments).
5. **Hazard Alerts**: Warn if the user is on track to overspend.

Format your response in Markdown. Be encouraging but direct.
`;

export const generateUserPrompt = (transactions: any[], user: any) => {
  const transactionSummary = transactions.map((t) => ({
    date: t.date,
    amount: t.amount,
    category: t.category,
    type: t.type,
    paymentMethod: t.paymentMethod,
    title: t.title,
  })).slice(0, 50); // Limit to last 50 for token saving

  return `
    User: ${user.name}
    Currency: ${user.currency}
    
    Here are my recent transactions:
    ${JSON.stringify(transactionSummary, null, 2)}
    
    Please analyze my spending and give me insights.
  `;
};
