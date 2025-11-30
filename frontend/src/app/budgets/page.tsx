'use client';

import { useEffect, useState } from 'react';
import { useBudgetStore, BudgetWithSpending } from '@/store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { BudgetDataTable } from '@/components/budgets/BudgetDataTable';
import { DEFAULT_CATEGORIES } from '@/lib/categoryConstants';

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

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.amount) {
            toast.error('Please fill all fields');
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
                return 'bg-green-100 text-green-700 border-green-200';
            case 'WARNING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CRITICAL':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'OVER':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
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

    return (
        <PageLayout
            title="Budgets"
            description="Track and manage your spending budgets"
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
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Set Budget
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Set New Budget'}</DialogTitle>
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
                                    <label className="text-sm font-medium">Amount Limit</label>
                                    <Input
                                        type="number"
                                        placeholder="5000"
                                        value={newBudget.amount}
                                        onChange={(e) =>
                                            setNewBudget({ ...newBudget, amount: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Period</label>
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
                                <Button onClick={handleAddBudget} className="w-full">
                                    {editingBudget ? 'Update Budget' : 'Save Budget'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[180px]">
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
                <p>Loading budgets...</p>
            ) : viewMode === 'table' ? (
                <BudgetDataTable
                    budgets={filteredBudgets}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            ) : filteredBudgets.length === 0 ? (
                <p>No budgets set.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBudgets.map((b) => (
                        <Card key={b.id} className={`border-2 ${getStatusColor(b.status)}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{b.category}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {b.period.toLowerCase()} budget
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(b)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(b.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Budget</span>
                                        <span className="font-semibold">{formatCurrency(b.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Spent</span>
                                        <span className="font-semibold text-red-600">
                                            {formatCurrency(b.spent)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Remaining</span>
                                        <span className={`font-semibold ${b.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(Math.abs(b.remaining))}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{b.percentage.toFixed(1)}%</span>
                                    </div>
                                    <Progress
                                        value={Math.min(b.percentage, 100)}
                                        className="h-2"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        {b.status === 'OVER' ? (
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                        ) : b.percentage > 50 ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        <span>{b.daysLeft} days left</span>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(b.status)}`}>
                                        {b.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </PageLayout>
    );
}
