'use client';

import { useEffect, useState, useMemo } from 'react';
import { useBudgetStore, BudgetWithSpending } from '@/store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Plus,
    TrendingUp,
    AlertTriangle,
    Wallet,
    Target,
    PiggyBank,
    CheckCircle2,
    XCircle,
    Clock,
    Sparkles,
    BarChart3,
    Edit2,
    Trash2,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { formatCurrency } from '@/lib/utils';
import { BudgetDataTable } from '@/components/budgets/BudgetDataTable';
import { DEFAULT_CATEGORIES } from '@/lib/categoryConstants';
import { TableSkeleton, BudgetCardsGridSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

export default function BudgetsPage() {
    const { budgetsWithSpending, fetchBudgetsWithSpending, addBudget, updateBudget, deleteBudget, isLoading } =
        useBudgetStore();
    const [isOpen, setIsOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);
    const [newBudget, setNewBudget] = useState({
        category: '',
        amount: '',
        period: 'MONTHLY',
    });
    const [periodFilter, setPeriodFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    useEffect(() => {
        fetchBudgetsWithSpending();
    }, [fetchBudgetsWithSpending]);

    // Calculate summary statistics
    const stats = useMemo(() => {
        const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0);
        const totalRemaining = totalBudget - totalSpent;
        const overBudget = budgetsWithSpending.filter(b => b.status === 'OVER').length;
        const onTrack = budgetsWithSpending.filter(b => b.status === 'ON_TRACK').length;
        const warning = budgetsWithSpending.filter(b => b.status === 'WARNING' || b.status === 'CRITICAL').length;
        const avgUsage = budgetsWithSpending.length > 0
            ? budgetsWithSpending.reduce((sum, b) => sum + b.percentage, 0) / budgetsWithSpending.length
            : 0;

        return { totalBudget, totalSpent, totalRemaining, overBudget, onTrack, warning, avgUsage };
    }, [budgetsWithSpending]);

    // Chart data
    const pieData = useMemo(() => {
        const statusCounts = {
            'On Track': budgetsWithSpending.filter(b => b.status === 'ON_TRACK').length,
            'Warning': budgetsWithSpending.filter(b => b.status === 'WARNING').length,
            'Critical': budgetsWithSpending.filter(b => b.status === 'CRITICAL').length,
            'Over Budget': budgetsWithSpending.filter(b => b.status === 'OVER').length,
        };
        return Object.entries(statusCounts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [budgetsWithSpending]);

    const barData = useMemo(() => {
        return budgetsWithSpending.slice(0, 6).map(b => ({
            category: b.category.length > 10 ? b.category.slice(0, 10) + '...' : b.category,
            Budget: b.amount,
            Spent: b.spent,
        }));
    }, [budgetsWithSpending]);

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.amount) {
            toast.error('Please fill all fields');
            return;
        }

        // Check for duplicate category budget
        const existingBudget = budgetsWithSpending.find(
            b => b.category === newBudget.category && b.period === newBudget.period && (!editingBudget || b.id !== editingBudget.id)
        );
        if (existingBudget) {
            toast.error(`A ${newBudget.period.toLowerCase()} budget for ${newBudget.category} already exists`);
            return;
        }

        if (editingBudget) {
            await updateBudget(editingBudget.id, {
                category: newBudget.category,
                amount: parseFloat(newBudget.amount),
                period: newBudget.period as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
            });
            toast.success('Budget updated');
        } else {
            await addBudget({
                category: newBudget.category,
                amount: parseFloat(newBudget.amount),
                period: newBudget.period as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
            });
            toast.success('Budget added');
        }

        setIsOpen(false);
        setEditingBudget(null);
        setNewBudget({ category: '', amount: '', period: 'MONTHLY' });
        await fetchBudgetsWithSpending();
    };

    const handleEdit = (budget: BudgetWithSpending) => {
        setEditingBudget(budget);
        setNewBudget({
            category: budget.category,
            amount: budget.amount.toString(),
            period: budget.period,
        });
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this budget?')) {
            await deleteBudget(id);
            toast.success('Budget deleted');
            await fetchBudgetsWithSpending();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON_TRACK':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'WARNING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'CRITICAL':
                return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'OVER':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 90) return 'bg-orange-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ON_TRACK':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'WARNING':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'CRITICAL':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'OVER':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    // Filter budgets
    const filteredBudgets = budgetsWithSpending.filter((b) => {
        if (periodFilter !== 'ALL' && b.period !== periodFilter) return false;
        if (statusFilter === 'ON_TRACK' && b.status !== 'ON_TRACK') return false;
        if (statusFilter === 'WARNING' && b.status !== 'WARNING' && b.status !== 'CRITICAL') return false;
        if (statusFilter === 'OVER' && b.status !== 'OVER') return false;
        return true;
    });

    // Get daily spending pace
    const getDailyPace = (budget: BudgetWithSpending) => {
        const daysInPeriod = budget.period === 'WEEKLY' ? 7 : budget.period === 'MONTHLY' ? 30 : 365;
        const idealDaily = budget.amount / daysInPeriod;
        const daysElapsed = daysInPeriod - budget.daysLeft;
        const actualDaily = daysElapsed > 0 ? budget.spent / daysElapsed : 0;
        const pace = idealDaily > 0 ? (actualDaily / idealDaily) * 100 : 0;
        return { idealDaily, actualDaily, pace, isOverspending: pace > 110 };
    };

    return (
        <PageLayout
            title="Budget Manager"
            description="Set spending limits and track your progress"
            action={
                <div className="flex gap-2">
                    <Select value={viewMode} onValueChange={(v: 'cards' | 'table') => setViewMode(v)}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cards">Card View</SelectItem>
                            <SelectItem value="table">Table View</SelectItem>
                        </SelectContent>
                    </Select>
                    <Dialog open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) {
                            setEditingBudget(null);
                            setNewBudget({ category: '', amount: '', period: 'MONTHLY' });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Create Budget
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-purple-500" />
                                    {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                                </DialogTitle>
                                <DialogDescription>
                                    Set a spending limit for a category to help manage your finances.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select
                                        value={newBudget.category}
                                        onValueChange={(val) =>
                                            setNewBudget({ ...newBudget, category: val })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEFAULT_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Budget Limit (₹)</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={newBudget.amount}
                                        onChange={(e) =>
                                            setNewBudget({ ...newBudget, amount: e.target.value })
                                        }
                                    />
                                    <p className="text-xs text-gray-500">
                                        Suggested: ₹5,000 - ₹50,000 based on category
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Budget Period</label>
                                    <Select
                                        value={newBudget.period}
                                        onValueChange={(val) =>
                                            setNewBudget({ ...newBudget, period: val })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleAddBudget} className="w-full bg-purple-600 hover:bg-purple-700">
                                    {editingBudget ? 'Update Budget' : 'Create Budget'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            {/* Summary Section */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Budget</p>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {formatCurrency(stats.totalBudget)}
                                </p>
                                <p className="text-xs text-purple-500 mt-1">
                                    {budgetsWithSpending.length} active budgets
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Spent</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {formatCurrency(stats.totalSpent)}
                                </p>
                                <p className="text-xs text-blue-500 mt-1">
                                    {stats.avgUsage.toFixed(0)}% avg usage
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Remaining</p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    stats.totalRemaining >= 0 ? "text-green-700 dark:text-green-300" : "text-red-600"
                                )}>
                                    {formatCurrency(Math.abs(stats.totalRemaining))}
                                </p>
                                <p className="text-xs text-green-500 mt-1">
                                    {stats.onTrack} budgets on track
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                                <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-2",
                    stats.overBudget > 0
                        ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-300 dark:border-red-800"
                        : "bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-300 dark:border-green-800"
                )}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={cn(
                                    "text-sm font-medium",
                                    stats.overBudget > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                )}>
                                    Budget Health
                                </p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    stats.overBudget > 0 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
                                )}>
                                    {stats.overBudget > 0 ? `${stats.overBudget} Over` : 'All Good!'}
                                </p>
                                <p className={cn(
                                    "text-xs mt-1",
                                    stats.overBudget > 0 ? "text-red-500" : "text-green-500"
                                )}>
                                    {stats.warning} need attention
                                </p>
                            </div>
                            <div className={cn(
                                "p-3 rounded-full",
                                stats.overBudget > 0 ? "bg-red-100 dark:bg-red-900/50" : "bg-green-100 dark:bg-green-900/50"
                            )}>
                                {stats.overBudget > 0 ? (
                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                ) : (
                                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            {budgetsWithSpending.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Status Distribution */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                Budget Status Overview
                            </CardTitle>
                            <CardDescription>Distribution of your budget health</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Budget vs Spent */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                Budget vs Actual Spending
                            </CardTitle>
                            <CardDescription>Top categories comparison</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={barData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" stroke="#6b7280" />
                                    <YAxis type="category" dataKey="category" width={80} stroke="#6b7280" />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="Budget" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="Spent" fill="#ef4444" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Periods</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ON_TRACK">On Track</SelectItem>
                        <SelectItem value="WARNING">Warning</SelectItem>
                        <SelectItem value="OVER">Over Budget</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                viewMode === 'table' ? (
                    <TableSkeleton rows={6} columns={6} showSearch={false} />
                ) : (
                    <BudgetCardsGridSkeleton count={6} />
                )
            ) : viewMode === 'table' ? (
                <BudgetDataTable
                    budgets={filteredBudgets}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            ) : filteredBudgets.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Target className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Budgets Set</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
                            Create budgets to track your spending and stay on top of your finances.
                        </p>
                        <Button onClick={() => setIsOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="mr-2 h-4 w-4" /> Create Your First Budget
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBudgets.map((b) => {
                        const pace = getDailyPace(b);
                        return (
                            <Card key={b.id} className={cn(
                                "border-l-4 hover:shadow-lg transition-all duration-200",
                                b.status === 'ON_TRACK' && "border-l-green-500",
                                b.status === 'WARNING' && "border-l-yellow-500",
                                b.status === 'CRITICAL' && "border-l-orange-500",
                                b.status === 'OVER' && "border-l-red-500"
                            )}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                getStatusColor(b.status)
                                            )}>
                                                {getStatusIcon(b.status)}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{b.category}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {b.period.toLowerCase()}
                                                    </Badge>
                                                    <Badge className={cn("text-xs", getStatusColor(b.status))}>
                                                        {b.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(b)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                                onClick={() => handleDelete(b.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-semibold">{b.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    getProgressColor(b.percentage)
                                                )}
                                                style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                            <p className="text-xs text-muted-foreground">Budget</p>
                                            <p className="font-semibold text-lg">{formatCurrency(b.amount)}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                            <p className="text-xs text-muted-foreground">Spent</p>
                                            <p className="font-semibold text-lg text-red-600">{formatCurrency(b.spent)}</p>
                                        </div>
                                    </div>

                                    {/* Remaining & Days */}
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Remaining</p>
                                            <p className={cn(
                                                "font-semibold",
                                                b.remaining >= 0 ? "text-green-600" : "text-red-600"
                                            )}>
                                                {b.remaining >= 0 ? formatCurrency(b.remaining) : `-${formatCurrency(Math.abs(b.remaining))}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{b.daysLeft} days left</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spending Pace Indicator */}
                                    {pace.isOverspending && b.status !== 'OVER' && (
                                        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>Spending {(pace.pace - 100).toFixed(0)}% faster than ideal pace</span>
                                        </div>
                                    )}

                                    {b.status === 'OVER' && (
                                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-400">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Over budget by {formatCurrency(Math.abs(b.remaining))}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </PageLayout>
    );
}
