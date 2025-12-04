'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RecurringTransaction {
    id: string;
    title: string;
    amount: number;
    nextDueDate: string;
    frequency: string;
}

interface UpcomingPaymentsWidgetProps {
    payments: RecurringTransaction[];
}

export function UpcomingPaymentsWidget({ payments }: UpcomingPaymentsWidgetProps) {
    if (payments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <p>No upcoming payments.</p>
                        <Link href="/recurring">
                            <Button variant="link" className="mt-2">Add Recurring Payment</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Payments</CardTitle>
                <Link href="/recurring">
                    <Button variant="ghost" size="sm">View All</Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {payments.map((payment) => {
                        const dueDate = new Date(payment.nextDueDate);
                        const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                        return (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <CalendarClock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{payment.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Due {dueDate.toLocaleDateString()} ({daysLeft} days)
                                        </p>
                                    </div>
                                </div>
                                <div className="font-bold text-sm">
                                    {formatCurrency(payment.amount)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
