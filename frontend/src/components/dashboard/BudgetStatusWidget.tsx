'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BudgetStatus {
    id: string;
    category: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'ON_TRACK' | 'WARNING' | 'CRITICAL' | 'OVER';
}

interface BudgetStatusWidgetProps {
    budgets: BudgetStatus[];
}

export function BudgetStatusWidget({ budgets }: BudgetStatusWidgetProps) {
    if (budgets.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Budget Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <p>No budgets set for this period.</p>
                        <Link href="/budgets">
                            <Button variant="link" className="mt-2">Set a Budget</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Budget Overview</CardTitle>
                <Link href="/budgets">
                    <Button variant="ghost" size="sm">View All</Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-6">
                {budgets.map((budget) => (
                    <div key={budget.id} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="font-medium">{budget.category}</div>
                            <div className="flex items-center gap-2">
                                <span className={
                                    budget.status === 'OVER' ? 'text-red-600' :
                                        budget.status === 'CRITICAL' ? 'text-orange-600' :
                                            budget.status === 'WARNING' ? 'text-yellow-600' :
                                                'text-green-600'
                                }>
                                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                                </span>
                                {budget.status === 'OVER' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            </div>
                        </div>
                        <Progress
                            value={Math.min(budget.percentage, 100)}
                            className={`h-2 ${budget.status === 'OVER' ? 'bg-red-100' :
                                budget.status === 'CRITICAL' ? 'bg-orange-100' :
                                    'bg-secondary'
                                }`}
                            indicatorClassName={
                                budget.status === 'OVER' ? 'bg-red-600' :
                                    budget.status === 'CRITICAL' ? 'bg-orange-600' :
                                        budget.status === 'WARNING' ? 'bg-yellow-600' :
                                            'bg-green-600'
                            }
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
