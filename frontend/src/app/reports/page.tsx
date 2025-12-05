'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    TrendingUp,
    PieChart,
    BarChart3,
    Download,
    FileText,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
    LineChart,
    Line,
} from 'recharts';

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
    savings: number;
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number;
}

interface TrendData {
    date: string;
    amount: number;
}

interface TransactionData {
    date: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
}

const COLORS = [
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#22c55e', // green
    '#f97316', // orange
    '#ef4444', // red
    '#3b82f6', // blue
    '#ec4899', // pink
    '#eab308', // yellow
    '#6366f1', // indigo
    '#14b8a6', // teal
];

export default function ReportsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalSavings: 0,
        avgMonthlyExpense: 0,
        topCategory: '',
        transactionCount: 0,
    });

    const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    const fetchReportsData = useCallback(async () => {
        setIsLoading(true);
        try {
            const startDate = new Date(parseInt(selectedYear), 0, 1).toISOString();
            const endDate = new Date(parseInt(selectedYear), 11, 31, 23, 59, 59).toISOString();

            const response = await api.get('/transactions', {
                params: { startDate, endDate },
            });

            const transactions = response.data;

            // Process monthly data
            const monthlyStatsMap: { [key: string]: { income: number; expense: number } } = {};
            const categoryStatsMap: { [key: string]: number } = {};
            const dailyTrendMap: { [key: string]: number } = {};

            let totalIncome = 0;
            let totalExpense = 0;

            const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];

            months.forEach(month => {
                monthlyStatsMap[month] = { income: 0, expense: 0 };
            });

            transactions.forEach((t: TransactionData) => {
                const date = new Date(t.date);
                const monthKey = months[date.getMonth()];
                const dateKey = date.toISOString().split('T')[0];

                if (t.type === 'INCOME') {
                    totalIncome += t.amount;
                    monthlyStatsMap[monthKey].income += t.amount;
                } else {
                    totalExpense += t.amount;
                    monthlyStatsMap[monthKey].expense += t.amount;
                    categoryStatsMap[t.category] = (categoryStatsMap[t.category] || 0) + t.amount;
                    dailyTrendMap[dateKey] = (dailyTrendMap[dateKey] || 0) + t.amount;
                }
            });

            // Format monthly data
            const formattedMonthlyData = months.map(month => ({
                month,
                income: monthlyStatsMap[month].income,
                expense: monthlyStatsMap[month].expense,
                savings: monthlyStatsMap[month].income - monthlyStatsMap[month].expense,
            }));
            setMonthlyData(formattedMonthlyData);

            // Format category data
            const sortedCategories = Object.entries(categoryStatsMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10);
            const formattedCategoryData = sortedCategories.map(([name, value], i) => ({
                name,
                value,
                color: COLORS[i % COLORS.length],
            }));
            setCategoryData(formattedCategoryData);

            // Format trend data (last 30 days of data)
            const sortedDates = Object.keys(dailyTrendMap).sort();
            const last30 = sortedDates.slice(-30);
            const formattedTrendData = last30.map(date => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                amount: dailyTrendMap[date],
            }));
            setTrendData(formattedTrendData);

            // Calculate summary
            const nonZeroMonths = formattedMonthlyData.filter(m => m.expense > 0).length || 1;
            setSummary({
                totalIncome,
                totalExpense,
                totalSavings: totalIncome - totalExpense,
                avgMonthlyExpense: totalExpense / nonZeroMonths,
                topCategory: sortedCategories[0]?.[0] || 'N/A',
                transactionCount: transactions.length,
            });

        } catch (error) {
            console.error('Failed to fetch reports data:', error);
            toast.error('Failed to load reports data');
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchReportsData();
    }, [fetchReportsData]);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const response = await api.get('/export/pdf-report', {
                params: { year: selectedYear },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `financial-report-${selectedYear}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('PDF report downloaded successfully');
        } catch (error) {
            console.error('PDF download failed:', error);
            toast.error('Failed to download PDF report');
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadExcel = async () => {
        setDownloading(true);
        try {
            const startDate = new Date(parseInt(selectedYear), 0, 1).toISOString();
            const endDate = new Date(parseInt(selectedYear), 11, 31, 23, 59, 59).toISOString();

            const response = await api.get('/export/dashboard', {
                params: { startDate, endDate },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `financial-report-${selectedYear}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Excel report downloaded successfully');
        } catch (error) {
            console.error('Excel download failed:', error);
            toast.error('Failed to download Excel report');
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <PageLayout title="Financial Reports">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Financial Reports"
            description="Comprehensive analysis of your spending and income"
            action={
                <div className="flex gap-2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px]">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {yearOptions.map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleDownloadExcel} disabled={downloading}>
                        <Download className="h-4 w-4 mr-2" />
                        Excel
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={downloading} className="bg-purple-600 hover:bg-purple-700">
                        <FileText className="h-4 w-4 mr-2" />
                        {downloading ? 'Generating...' : 'PDF Report'}
                    </Button>
                </div>
            }
        >
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Income</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {formatCurrency(summary.totalIncome)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                                <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Expense</p>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                    {formatCurrency(summary.totalExpense)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                                <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Net Savings</p>
                                <p className={`text-2xl font-bold ${summary.totalSavings >= 0 ? 'text-purple-700 dark:text-purple-300' : 'text-red-600'}`}>
                                    {formatCurrency(summary.totalSavings)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Avg Monthly</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {formatCurrency(summary.avgMonthlyExpense)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Trends
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                        <PieChart className="h-4 w-4 mr-2" />
                        Categories
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Monthly Income vs Expense */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Income vs Expense</CardTitle>
                                <CardDescription>Compare your monthly earnings and spending</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Monthly Savings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Savings</CardTitle>
                                <CardDescription>Track your monthly savings progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="savings"
                                            stroke="#8b5cf6"
                                            fill="url(#savingsGradient)"
                                            name="Savings"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="trends">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Spending Trend</CardTitle>
                            <CardDescription>Your spending pattern over the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                                        name="Spending"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Expense by Category</CardTitle>
                                <CardDescription>Distribution of your expenses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPie>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Category List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Spending Categories</CardTitle>
                                <CardDescription>Where your money goes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {categoryData.map((category, index) => (
                                        <div key={category.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {formatCurrency(category.value)}
                                                </span>
                                                <Badge variant="secondary">
                                                    #{index + 1}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </PageLayout>
    );
}
