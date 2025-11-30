'use client';

import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { PageLayout } from '@/components/layout/PageLayout';

const CATEGORIES = [
    'All',
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

export default function TransactionsPage() {
    const { transactions, fetchTransactions, deleteTransaction, isLoading } =
        useTransactionStore();
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');

    useEffect(() => {
        const filters: Record<string, string> = {};
        if (typeFilter !== 'all') filters.type = typeFilter;
        if (categoryFilter !== 'all') filters.category = categoryFilter;

        fetchTransactions(filters);
    }, [typeFilter, categoryFilter, fetchTransactions]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
            toast.success('Transaction deleted');
        }
    };

    return (
        <PageLayout
            title="Transactions"
            action={
                <Link href="/transactions/add">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                </Link>
            }
        >
            <div className="flex gap-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Category" />
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

            <div className="space-y-4">
                {isLoading ? (
                    <p>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                    <p>No transactions found.</p>
                ) : (
                    transactions.map((t) => (
                        <Card key={t.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold">{t.title}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {t.category} • {new Date(t.date).toLocaleDateString()}
                                    </span>
                                    {t.notes && (
                                        <span className="text-xs text-gray-500">{t.notes}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </span>
                                    <Link href={`/transactions/edit/${t.id}`}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                        >
                                            <Pencil className="h-4 w-4 text-blue-500" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(t.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </PageLayout>
    );
}
