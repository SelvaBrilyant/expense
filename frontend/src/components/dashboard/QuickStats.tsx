'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
    TrendingUp,
    Calendar,
    DollarSign,
    PieChart,
    Zap,
    Target
} from 'lucide-react';

interface QuickStatsProps {
    summary: {
        totalIncome: number;
        totalExpense: number;
        balance: number;
    };
    stats: {
        count: number;
        incomeCount: number;
        expenseCount: number;
        largestExpense: number;
    };
    categoryCount: number;
    period: string;
    daysInPeriod: number;
}

export function QuickStats({ summary, stats, categoryCount, period, daysInPeriod }: QuickStatsProps) {
    // Calculate average transaction value
    const avgExpense = stats.expenseCount > 0
        ? summary.totalExpense / stats.expenseCount
        : 0;

    // Calculate daily average expense
    const dailyAvg = daysInPeriod > 0
        ? summary.totalExpense / daysInPeriod
        : 0;

    // Calculate savings rate
    const savingsRate = summary.totalIncome > 0
        ? ((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100
        : 0;

    const quickStatsData = [
        {
            label: 'Avg Expense',
            value: formatCurrency(avgExpense),
            icon: DollarSign,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            description: 'Per transaction',
        },
        {
            label: 'Daily Average',
            value: formatCurrency(dailyAvg),
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            description: `Over ${daysInPeriod} days`,
        },
        {
            label: 'Largest Expense',
            value: formatCurrency(stats.largestExpense),
            icon: TrendingUp,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            description: 'Single transaction',
        },
        {
            label: 'Categories Used',
            value: categoryCount.toString(),
            icon: PieChart,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            description: 'This period',
        },
        {
            label: 'Savings Rate',
            value: `${savingsRate.toFixed(1)}%`,
            icon: Target,
            color: savingsRate >= 20 ? 'text-green-600' : 'text-yellow-600',
            bgColor: savingsRate >= 20 ? 'bg-green-100' : 'bg-yellow-100',
            description: savingsRate >= 20 ? 'Great job!' : 'Keep saving',
        },
        {
            label: 'Total Transactions',
            value: stats.count.toString(),
            icon: Zap,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            description: `In ${period}`,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {quickStatsData.map(({ label, value, icon: Icon, color, bgColor, description }) => (
                        <div
                            key={label}
                            className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className={`p-2 rounded-lg ${bgColor}`}>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                <p className={`text-xl font-bold ${color}`}>{value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
