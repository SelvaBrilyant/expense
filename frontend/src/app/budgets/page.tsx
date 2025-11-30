'use client';

import { useEffect, useState } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
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
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';

const CATEGORIES = [
    'Food',
    'Travel',
    'Groceries',
    'Entertainment',
    'Shopping',
    'Bills',
    'Investments',
    'Loans',
    'UPI Payments',
    'Others',
];

export default function BudgetsPage() {
    const { budgets, fetchBudgets, addBudget, deleteBudget, isLoading } =
        useBudgetStore();
    const [isOpen, setIsOpen] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category: '',
        amount: '',
        period: 'MONTHLY',
    });

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.amount) {
            toast.error('Please fill all fields');
            return;
        }
        await addBudget({
            ...newBudget,
            amount: parseFloat(newBudget.amount),
        });
        setIsOpen(false);
        setNewBudget({ category: '', amount: '', period: 'MONTHLY' });
        toast.success('Budget added');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this budget?')) {
            await deleteBudget(id);
            toast.success('Budget deleted');
        }
    };

    return (
        <PageLayout
            title="Budgets"
            action={
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Set Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set New Budget</DialogTitle>
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
                                        {CATEGORIES.map((cat) => (
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
                            <Button onClick={handleAddBudget} className="w-full">
                                Save Budget
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            }
        >
            <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <p>Loading budgets...</p>
                ) : budgets.length === 0 ? (
                    <p>No budgets set.</p>
                ) : (
                    budgets.map((b) => (
                        <Card key={b.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {b.category}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(b.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{b.amount}</div>
                                <p className="text-xs text-muted-foreground">
                                    {b.period.toLowerCase()} limit
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </PageLayout>
    );
}
