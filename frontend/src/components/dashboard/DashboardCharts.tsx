'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartDataPoint {
    date: string;
    income: number;
    expense: number;
}

interface CategoryStat {
    category: string;
    amount: number;
}

interface DashboardChartsProps {
    chartData: ChartDataPoint[];
    expenseByCategory: CategoryStat[];
}

const COLORS = [
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#6366F1',
    '#EF4444',
    '#14B8A6',
];

export function DashboardCharts({ chartData, expenseByCategory }: DashboardChartsProps) {
    // Line Chart - Daily Trend
    // Format date for display
    const lineChartData = chartData.map(item => ({
        ...item,
        day: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    }));

    // Bar Chart - Top Categories
    const barChartData = [...expenseByCategory]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // Top 8 categories

    // Pie Chart - Distribution
    const totalExpense = expenseByCategory.reduce((acc, item) => acc + item.amount, 0);
    const pieChartData = expenseByCategory
        .map(item => ({
            name: item.category,
            value: item.amount,
            percentage: totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : '0',
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6

    return (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {/* Line Chart - Daily Expenses */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base">Daily Income & Expense Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                    {lineChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px] sm:h-[300px] text-muted-foreground text-sm">
                            <p>No data available for this period.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={window?.innerWidth < 640 ? 200 : 300}>
                            <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 10 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip
                                    formatter={(value) => `₹${Number(value).toFixed(2)}`}
                                    contentStyle={{ fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Income"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    name="Expense"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Pie Chart - Expense Distribution */}
            <Card className="col-span-1">
                <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base">Expense Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                    {pieChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px] sm:h-[300px] text-muted-foreground text-sm">
                            <p>No expense data available</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={window?.innerWidth < 640 ? 200 : 300}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={window?.innerWidth >= 640 ? (props) => `${props.name} (${props.payload.percentage}%)` : false}
                                    outerRadius={window?.innerWidth < 640 ? 60 : 80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `₹${Number(value).toFixed(2)}`}
                                    contentStyle={{ fontSize: '12px' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '10px' }}
                                    layout="horizontal"
                                    align="center"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Bar Chart - Category Breakdown */}
            <Card className="col-span-1 lg:col-span-3">
                <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base">Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                    {barChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px] sm:h-[300px] text-muted-foreground text-sm">
                            <p>No expense data available</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={window?.innerWidth < 640 ? 200 : 300}>
                            <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="category"
                                    tick={{ fontSize: 10 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip
                                    formatter={(value) => `₹${Number(value).toFixed(2)}`}
                                    contentStyle={{ fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="amount" fill="#EC4899" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
