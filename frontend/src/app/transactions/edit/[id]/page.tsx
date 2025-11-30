'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useTransactionStore } from '@/store/transactionStore';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, 'Category is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    date: z.string(),
    notes: z.string().optional(),
});

const EXPENSE_CATEGORIES = [
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

const INCOME_CATEGORIES = [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Gift',
    'Rental',
    'Refund',
    'Other',
];

const PAYMENT_METHODS = ['CASH', 'CARD', 'UPI', 'WALLET', 'NET_BANKING', 'OTHER'];

export default function EditTransactionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { transactions, updateTransaction, isLoading } = useTransactionStore();
    const [transaction, setTransaction] = useState<any>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            amount: '',
            type: 'EXPENSE',
            category: '',
            paymentMethod: 'UPI',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        },
    });

    useEffect(() => {
        const found = transactions.find((t) => t.id === id);
        if (found) {
            setTransaction(found);
            form.reset({
                title: found.title,
                amount: found.amount.toString(),
                type: found.type,
                category: found.category,
                paymentMethod: found.paymentMethod,
                date: new Date(found.date).toISOString().split('T')[0],
                notes: found.notes || '',
            });
        }
    }, [id, transactions, form]);

    const type = form.watch('type');

    // Reset category when type changes
    useEffect(() => {
        if (transaction && transaction.type !== type) {
            form.setValue('category', '');
        }
    }, [type, form, transaction]);

    const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await updateTransaction(id, {
            ...values,
            amount: Number(values.amount),
        });
        const state = useTransactionStore.getState();
        if (!state.error) {
            toast.success('Transaction updated successfully');
            router.push('/transactions');
        } else {
            toast.error(state.error);
        }
    }

    if (!transaction) {
        return (
            <div className="p-8 flex justify-center items-center bg-gray-50 min-h-screen dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="p-8 flex justify-center bg-gray-50 min-h-screen dark:bg-gray-900">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder={type === 'INCOME' ? 'Salary, Freelance...' : 'Grocery Shopping'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="INCOME">Income</SelectItem>
                                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Method</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {PAYMENT_METHODS.map((method) => (
                                                        <SelectItem key={method} value={method}>
                                                            {method}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Additional details..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Transaction'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
