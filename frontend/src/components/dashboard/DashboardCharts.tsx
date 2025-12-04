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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Line Chart - Daily Expenses */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Daily Income & Expense Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    {lineChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <p>No data available for this period.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                                <Legend />
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
            <Card>
                <CardHeader>
                    <CardTitle>Expense Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    {pieChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <p>No expense data available</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props) => `${props.name} (${props.payload.percentage}%)`}
                                    outerRadius={80}
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
                                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Bar Chart - Category Breakdown */}
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    {barChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <p>No expense data available</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="amount" fill="#EC4899" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
