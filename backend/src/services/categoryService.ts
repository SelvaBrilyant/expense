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
];

// Get all categories for a user (includes defaults + custom)
export const getAllCategories = (customCategories: string[] = []): string[] => {
  return [...DEFAULT_CATEGORIES, ...customCategories];
};

// Validate category
export const isValidCategory = (category: string, customCategories: string[] = []): boolean => {
  const allCategories = getAllCategories(customCategories);
  return allCategories.includes(category);
};
