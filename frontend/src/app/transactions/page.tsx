'use client';

import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { TransactionsDataTable } from '@/components/transactions/TransactionsDataTable';
import { TableSkeleton } from '@/components/ui/skeleton';

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
        if (typeFilter !== 'ALL') filters.type = typeFilter;
        if (categoryFilter !== 'All') filters.category = categoryFilter;

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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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

            {isLoading ? (
                <TableSkeleton rows={8} columns={6} showSearch={true} />
            ) : (
                <TransactionsDataTable
                    transactions={transactions}
                    onDelete={handleDelete}
                />
            )}
        </PageLayout>
    );
}
