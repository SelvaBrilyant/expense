'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardData {
    summary: {
        totalIncome: number;
        totalExpense: number;
        balance: number;
    };
    stats: {
        count: number;
    };
}

interface MonthlyComparisonProps {
    currentMonth: DashboardData;
    previousMonth: DashboardData;
    currentMonthName: string;
    previousMonthName: string;
}

function calculateChange(current: number, previous: number): {
    percentage: number;
    isIncrease: boolean;
} {
    if (previous === 0) {
        return { percentage: current > 0 ? 100 : 0, isIncrease: current > 0 };
    }

    const change = ((current - previous) / previous) * 100;
    return {
        percentage: Math.abs(change),
        isIncrease: change > 0,
    };
}

export function MonthlyComparison({
    currentMonth,
    previousMonth,
    currentMonthName,
    previousMonthName,
}: MonthlyComparisonProps) {
    const incomeChange = calculateChange(currentMonth.summary.totalIncome, previousMonth.summary.totalIncome);
    const expenseChange = calculateChange(currentMonth.summary.totalExpense, previousMonth.summary.totalExpense);
    const balanceChange = calculateChange(currentMonth.summary.balance, previousMonth.summary.balance);

    const comparisonData = [
        {
            label: 'Income',
            current: currentMonth.summary.totalIncome,
            previous: previousMonth.summary.totalIncome,
            change: incomeChange,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            label: 'Expenses',
            current: currentMonth.summary.totalExpense,
            previous: previousMonth.summary.totalExpense,
            change: expenseChange,
            icon: TrendingDown,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
        {
            label: 'Net Balance',
            current: currentMonth.summary.balance,
            previous: previousMonth.summary.balance,
            change: balanceChange,
            icon: currentMonth.summary.balance >= 0 ? TrendingUp : TrendingDown,
            color: currentMonth.summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
            bgColor: currentMonth.summary.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Month-over-Month Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {currentMonthName} vs {previousMonthName}
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {comparisonData.map(({ label, current, previous, change, icon: Icon, color, bgColor }) => (
                        <div key={label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${bgColor}`}>
                                        <Icon className={`h-4 w-4 ${color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Previous: {formatCurrency(previous)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${color}`}>
                                        {formatCurrency(current)}
                                    </p>
                                    <div className={`flex items-center gap-1 text-xs ${change.isIncrease ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {change.isIncrease ? (
                                            <ArrowUpRight className="h-3 w-3" />
                                        ) : (
                                            <ArrowDownRight className="h-3 w-3" />
                                        )}
                                        <span>{change.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Transaction Count</span>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{previousMonth.stats.count}</span>
                                <span>→</span>
                                <span className="font-medium">{currentMonth.stats.count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
