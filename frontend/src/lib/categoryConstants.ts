// Default expense categories
export const DEFAULT_CATEGORIES = [
  'Self Care',
  'Shakes',
  'Subscriptions',
  'Transport',
  'Groceries',
  'Bills',
  'Food',
  'Travel',
  'Entertainment',
  'Shopping',
  'Investments',
  'Loans',
  'UPI Payments',
  'Others',
] as const;

// Export type
export type Category = typeof DEFAULT_CATEGORIES[number];
