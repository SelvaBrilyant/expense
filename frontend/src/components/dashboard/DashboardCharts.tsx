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

interface Transaction {
    id: string;
    date: string;
    amount: number;
    category: string;
    type: string;
}

interface DashboardChartsProps {
    transactions: Transaction[];
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

export function DashboardCharts({ transactions }: DashboardChartsProps) {
    // Monthly expenses data - improved with proper date sorting
    const monthlyDataMap = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc: { [key: string]: { amount: number; date: Date } }, t) => {
            const date = new Date(t.date);
            // Handle invalid dates
            if (isNaN(date.getTime())) {
                console.warn('Invalid date found in transaction:', t);
                return acc;
            }
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[yearMonth]) {
                acc[yearMonth] = { amount: 0, date };
            }
            acc[yearMonth].amount += t.amount;
            return acc;
        }, {});

    const lineChartData = Object.entries(monthlyDataMap)
        .map(([key, data]) => ({
            month: new Date(data.date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
            }),
            amount: Number(data.amount.toFixed(2)), // Round to 2 decimal places
            sortKey: key,
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey)) // Sort chronologically
        .slice(-6) // Last 6 months
        .map(({ month, amount }) => ({ month, amount })); // Remove sortKey from final data

    // Category expenses data
    const categoryData = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc: { [key: string]: number }, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    const barChartData = Object.entries(categoryData)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // Top 8 categories

    // Pie chart data (percentage distribution)
    const totalExpense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.amount, 0);

    const pieChartData = Object.entries(categoryData)
        .map(([category, amount]) => ({
            name: category,
            value: amount,
            percentage: ((amount / totalExpense) * 100).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 for readability

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Line Chart - Monthly Expenses */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Monthly Expenses Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    {lineChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <p>No expense data available. Add some transactions to see the trend.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    name="Expenses"
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
