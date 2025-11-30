'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { AIAdvisor } from '@/components/ai/AIAdvisor';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { transactions, fetchTransactions, isLoading } = useTransactionStore();
    const [aiInsights, setAiInsights] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchTransactions();
        fetchAIInsights();
    }, [fetchTransactions]);

    const fetchAIInsights = async () => {
        if (transactions.length === 0) return;

        setAiLoading(true);
        try {
            const response = await api.post('/ai/insights');
            setAiInsights(response.data.insights);
        } catch (error) {
            console.error('Failed to fetch AI insights:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        setDownloading(true);
        try {
            const response = await api.get('/export/dashboard', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `dashboard-export-${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Dashboard exported to Excel');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export dashboard');
        } finally {
            setDownloading(false);
        }
    };

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
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDownloadExcel}
                        disabled={downloading}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {downloading ? 'Downloading...' : 'Download Excel'}
                    </Button>
                    <Link href="/transactions/add">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    </Link>
                </div>
            }
        >
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
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

            {/* Charts */}
            {transactions.length > 0 && (
                <div className="mb-6">
                    <DashboardCharts transactions={transactions} />
                </div>
            )}

            {/* AI Advisor + Recent Transactions */}
            <div className="grid gap-4 md:grid-cols-7">
                <div className="col-span-4">
                    <AIAdvisor insights={aiInsights} isLoading={aiLoading} />
                </div>

                <Card className="col-span-3">
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
            </div>
        </PageLayout>
    );
}
