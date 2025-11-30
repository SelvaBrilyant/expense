'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageLayout } from '@/components/layout/PageLayout';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { transactions, fetchTransactions, isLoading } = useTransactionStore();

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const totalIncome = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
        <PageLayout
            title="Dashboard"
            description={`Welcome back, ${user?.name || 'User'}`}
            action={
                <Link href="/transactions/add">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                </Link>
            }
        >
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            +{formatCurrency(totalIncome)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            -{formatCurrency(totalExpense)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : transactions.length === 0 ? (
                                <p>No transactions found.</p>
                            ) : (
                                transactions.slice(0, 5).map((t) => (
                                    <div key={t.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{t.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {t.category} • {new Date(t.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div
                                            className={`ml-auto font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for Chart */}
                        <div className="h-[200px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                            Chart Coming Soon
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
