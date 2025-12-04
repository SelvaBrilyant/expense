'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, ShoppingCart, Home, Coffee, Car, Utensils, Film } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CategoryStat {
    category: string;
    amount: number;
}

interface SpendingInsightsProps {
    expenseByCategory: CategoryStat[];
    period: string;
}

const categoryIcons: Record<string, LucideIcon> = {
    'Shopping': ShoppingCart,
    'Food': Utensils,
    'Transport': Car,
    'Housing': Home,
    'Entertainment': Film,
    'Coffee': Coffee,
};

export function SpendingInsights({ expenseByCategory, period }: SpendingInsightsProps) {
    // Sort by amount desc
    const sortedCategories = [...expenseByCategory]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const totalExpenses = expenseByCategory.reduce((sum, item) => sum + item.amount, 0);

    if (sortedCategories.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Spending Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No expenses recorded for {period}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Top Spending Categories
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sortedCategories.map(({ category, amount }, index) => {
                        const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0';
                        const Icon = categoryIcons[category] || ShoppingCart;

                        return (
                            <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${index === 0 ? 'bg-red-100 text-red-600' :
                                            index === 1 ? 'bg-orange-100 text-orange-600' :
                                                index === 2 ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{category}</p>
                                            <p className="text-xs text-muted-foreground">{percentage}% of expenses</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-red-600">
                                        -{formatCurrency(amount)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${index === 0 ? 'bg-red-500' :
                                            index === 1 ? 'bg-orange-500' :
                                                index === 2 ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
