'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Download, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { AIAdvisor } from '@/components/ai/AIAdvisor';
import { SpendingInsights } from '@/components/dashboard/SpendingInsights';
import { MonthlyComparison } from '@/components/dashboard/MonthlyComparison';
import { QuickStats } from '@/components/dashboard/QuickStats';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BudgetStatusWidget } from '@/components/dashboard/BudgetStatusWidget';
import { UpcomingPaymentsWidget } from '@/components/dashboard/UpcomingPaymentsWidget';
import {
    CardSkeleton,
    QuickStatsSkeleton,
    WidgetSkeleton,
    ChartSkeleton,
    TransactionListSkeleton,
    InsightsSkeleton,
} from '@/components/ui/skeleton';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { transactions: salaryTransactions, fetchTransactions } = useTransactionStore();
    const {
        summary,
        stats,
        recentTransactions,
        expenseByCategory,
        chartData,
        budgetStatus,
        upcomingRecurring,
        previousPeriodData,
        fetchDashboardData,
        fetchPreviousDashboardData,
        isLoading
    } = useDashboardStore();

    const [aiInsights, setAiInsights] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Get current month and year
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

    // Generate year options (current year and past 5 years)
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i);

    // Month options
    const monthOptions = [
        { value: '0', label: 'January' },
        { value: '1', label: 'February' },
        { value: '2', label: 'March' },
        { value: '3', label: 'April' },
        { value: '4', label: 'May' },
        { value: '5', label: 'June' },
        { value: '6', label: 'July' },
        { value: '7', label: 'August' },
        { value: '8', label: 'September' },
        { value: '9', label: 'October' },
        { value: '10', label: 'November' },
        { value: '11', label: 'December' },
    ];

    // State for salary-based financial month boundaries
    const [financialMonthStart, setFinancialMonthStart] = useState<Date | null>(null);
    const [financialMonthEnd, setFinancialMonthEnd] = useState<Date | null>(null);

    // 1. Fetch Salary Transactions for the selected year to determine boundaries
    useEffect(() => {
        const yearStart = new Date(parseInt(selectedYear), 0, 1);
        const yearEnd = new Date(parseInt(selectedYear) + 1, 11, 31, 23, 59, 59);

        const filters = {
            startDate: yearStart.toISOString(),
            endDate: yearEnd.toISOString(),
            category: 'Salary', // Optimization: Fetch only salary transactions
            type: 'INCOME'
        };

        fetchTransactions(filters);
    }, [selectedYear, fetchTransactions]);

    // 2. Calculate Financial Month Boundaries
    useEffect(() => {
        if (salaryTransactions.length >= 0) { // Run even if empty to set fallback
            calculateFinancialMonthBoundaries();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [salaryTransactions, selectedMonth, selectedYear]);

    // 3. Fetch Dashboard Data when boundaries change
    useEffect(() => {
        if (financialMonthStart && financialMonthEnd) {
            // Fetch current period data
            fetchDashboardData(financialMonthStart.toISOString(), financialMonthEnd.toISOString());

            // Calculate previous period boundaries
            // Logic: Previous period ends 1ms before current period starts.
            // Start depends on previous salary.
            // For simplicity, we can approximate previous period as 1 month duration before start.
            // Or better, we should find the previous financial month boundaries.
            // But finding previous boundaries requires logic.
            // Let's use a simple approximation: 1 month duration before start.

            const prevEnd = new Date(financialMonthStart);
            prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

            const prevStart = new Date(prevEnd);
            prevStart.setMonth(prevStart.getMonth() - 1); // Approximate

            fetchPreviousDashboardData(prevStart.toISOString(), prevEnd.toISOString());

            // AI Insights
            fetchAIInsights();
        }
    }, [financialMonthStart, financialMonthEnd, fetchDashboardData, fetchPreviousDashboardData]);


    const calculateFinancialMonthBoundaries = () => {
        // Filter salary transactions from the store (which now only contains salary/income)
        const salaries = salaryTransactions
            .filter((t) => t.type === 'INCOME' && t.category.toLowerCase() === 'salary')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (salaries.length === 0) {
            // No salary found, fall back to calendar month
            const start = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
            const end = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0, 23, 59, 59);
            setFinancialMonthStart(start);
            setFinancialMonthEnd(end);
            return;
        }

        // Find the salary transaction in the selected month
        const currentMonthSalary = salaries.find((t) => {
            const salaryDate = new Date(t.date);
            return (
                salaryDate.getMonth() === parseInt(selectedMonth) &&
                salaryDate.getFullYear() === parseInt(selectedYear)
            );
        });

        if (currentMonthSalary) {
            // Found salary in selected month - use it as start
            const startDate = new Date(currentMonthSalary.date);
            setFinancialMonthStart(startDate);

            // Find next salary transaction
            const nextSalary = salaries.find((t) => {
                const tDate = new Date(t.date);
                return tDate.getTime() > startDate.getTime();
            });

            if (nextSalary) {
                // End is the day before next salary
                const endDate = new Date(nextSalary.date);
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                setFinancialMonthEnd(endDate);
            } else {
                // No next salary found, use end of next month as fallback
                const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 2, 0, 23, 59, 59);
                setFinancialMonthEnd(endDate);
            }
        } else {
            // No salary in selected month, find the previous salary
            const previousSalary = [...salaries]
                .reverse()
                .find((t) => {
                    const salaryDate = new Date(t.date);
                    const selectedDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 15);
                    return salaryDate.getTime() < selectedDate.getTime();
                });

            if (previousSalary) {
                const startDate = new Date(previousSalary.date);
                setFinancialMonthStart(startDate);

                // Find next salary after the previous one
                const nextSalary = salaries.find((t) => {
                    const tDate = new Date(t.date);
                    return tDate.getTime() > startDate.getTime();
                });

                if (nextSalary) {
                    const endDate = new Date(nextSalary.date);
                    endDate.setDate(endDate.getDate() - 1);
                    endDate.setHours(23, 59, 59, 999);
                    setFinancialMonthEnd(endDate);
                } else {
                    const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0, 23, 59, 59);
                    setFinancialMonthEnd(endDate);
                }
            } else {
                // Fallback to calendar month
                const start = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
                const end = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0, 23, 59, 59);
                setFinancialMonthStart(start);
                setFinancialMonthEnd(end);
            }
        }
    };

    const fetchAIInsights = async () => {
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
        if (!financialMonthStart || !financialMonthEnd) return;

        setDownloading(true);
        try {
            const response = await api.get('/export/dashboard', {
                params: {
                    startDate: financialMonthStart.toISOString(),
                    endDate: financialMonthEnd.toISOString(),
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const monthName = monthOptions[parseInt(selectedMonth)].label;
            link.setAttribute('download', `dashboard-${monthName}-${selectedYear}-financial-month-${new Date().getTime()}.xlsx`);
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

    // Calculate days in period for stats
    const daysInPeriod = financialMonthStart && financialMonthEnd
        ? Math.ceil((financialMonthEnd.getTime() - financialMonthStart.getTime()) / (1000 * 60 * 60 * 24))
        : 30;

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
            {/* Month and Year Filter */}
            <Card className="mb-6 overflow-hidden border-2 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardContent className="pt-1 pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        {/* Left Section - Title and Icon */}
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold tracking-tight">Financial Month Period</h3>
                                <p className="text-xs text-muted-foreground">
                                    {financialMonthStart && financialMonthEnd ? (
                                        <>
                                            {financialMonthStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {' → '}
                                            {financialMonthEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </>
                                    ) : (
                                        `Viewing: ${monthOptions[parseInt(selectedMonth)].label} ${selectedYear}`
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Right Section - Controls */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Month Selector */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Month
                                </label>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-[160px] h-10 border-2 hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthOptions.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year Selector */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Year
                                </label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[120px] h-10 border-2 hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quick Action - Current Month */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-transparent select-none">
                                    Action
                                </label>
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() => {
                                        const now = new Date();
                                        setSelectedMonth(now.getMonth().toString());
                                        setSelectedYear(now.getFullYear().toString());
                                    }}
                                    className="h-10 border-2 hover:bg-primary/10 hover:border-primary transition-all"
                                    disabled={
                                        selectedMonth === currentDate.getMonth().toString() &&
                                        selectedYear === currentDate.getFullYear().toString()
                                    }
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Current Month
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {isLoading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Balance ({monthOptions[parseInt(selectedMonth)].label} {selectedYear})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Net for selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Income ({monthOptions[parseInt(selectedMonth)].label} {selectedYear})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    +{formatCurrency(summary.totalIncome)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <p>
                                        💰 Total Income
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Expenses ({monthOptions[parseInt(selectedMonth)].label} {selectedYear})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    -{formatCurrency(summary.totalExpense)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total expenses for selected period
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Quick Statistics */}
            <div className="mb-6">
                {isLoading ? (
                    <QuickStatsSkeleton />
                ) : (
                    <QuickStats
                        summary={summary}
                        stats={stats}
                        categoryCount={expenseByCategory.length}
                        period={monthOptions[parseInt(selectedMonth)].label}
                        daysInPeriod={daysInPeriod}
                    />
                )}
            </div>

            {/* Spending Insights and Monthly Comparison */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
                {isLoading ? (
                    <>
                        <InsightsSkeleton />
                        <InsightsSkeleton />
                    </>
                ) : (
                    <>
                        <SpendingInsights
                            expenseByCategory={expenseByCategory}
                            period={monthOptions[parseInt(selectedMonth)].label}
                        />
                        {previousPeriodData && (
                            <MonthlyComparison
                                currentMonth={{ summary, stats }}
                                previousMonth={previousPeriodData}
                                currentMonthName={monthOptions[parseInt(selectedMonth)].label}
                                previousMonthName="Previous Period"
                            />
                        )}
                    </>
                )}
            </div>

            {/* Budgets and Recurring */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
                {isLoading ? (
                    <>
                        <WidgetSkeleton />
                        <WidgetSkeleton />
                    </>
                ) : (
                    <>
                        <BudgetStatusWidget budgets={budgetStatus} />
                        <UpcomingPaymentsWidget payments={upcomingRecurring} />
                    </>
                )}
            </div>

            {/* Charts */}
            <div className="mb-6">
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </div>
                ) : (
                    <DashboardCharts chartData={chartData} expenseByCategory={expenseByCategory} />
                )}
            </div>

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
                                <TransactionListSkeleton count={5} />
                            ) : recentTransactions.length === 0 ? (
                                <p>No transactions found.</p>
                            ) : (
                                recentTransactions.map((t) => (
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
