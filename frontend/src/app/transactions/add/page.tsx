'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { TransactionItemForm, TransactionItem } from '@/components/transactions/TransactionItemForm';
import { Upload, FileText, X } from 'lucide-react';
import api from '@/lib/api';
import { PageLayout } from '@/components/layout/PageLayout';

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

export default function AddTransactionPage() {
    const router = useRouter();
    const { addTransaction, isLoading } = useTransactionStore();
    const [items, setItems] = useState<TransactionItem[]>([]);
    const [invoice, setInvoice] = useState<File | null>(null);
    const [invoiceUrl, setInvoiceUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

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

    const type = form.watch('type');

    // Reset category when type changes
    useEffect(() => {
        form.setValue('category', '');
    }, [type, form]);

    const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF and image files are allowed');
            return;
        }

        setInvoice(file);

        // Upload to backend
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('invoice', file);

            const response = await api.post('/upload/invoice', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setInvoiceUrl(response.data.url);
            toast.success('Invoice uploaded successfully');
        } catch (error) {
            console.error('Invoice upload failed:', error);
            toast.error('Failed to upload invoice');
            setInvoice(null);
        } finally {
            setUploading(false);
        }
    };

    const removeInvoice = () => {
        setInvoice(null);
        setInvoiceUrl('');
    };

    const handleTotalChange = (total: number) => {
        if (total > 0) {
            form.setValue('amount', total.toString());
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await addTransaction({
            ...values,
            amount: Number(values.amount),
            invoiceUrl: invoiceUrl || undefined,
            items: items.length > 0 ? items : undefined,
        });
        const state = useTransactionStore.getState();
        if (!state.error) {
            toast.success('Transaction added successfully');
            router.push('/dashboard');
        } else {
            toast.error(state.error);
        }
    }

    return (
        <PageLayout title="Add Transaction">
            <Card className="">
                <CardContent className="pt-6">
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
                                            <FormLabel>Amount{items.length > 0 && ' (Auto-calculated from items)'}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    {...field}
                                                    disabled={items.length > 0}
                                                />
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
                                                defaultValue={field.value}
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
                                                defaultValue={field.value}
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

                            {/* Invoice Upload Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Invoice (Optional)</label>
                                {!invoice ? (
                                    <div className="border-2 border-dashed rounded-lg p-4">
                                        <input
                                            type="file"
                                            id="invoice-upload"
                                            className="hidden"
                                            accept=".pdf,image/*"
                                            onChange={handleInvoiceUpload}
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="invoice-upload"
                                            className="flex flex-col items-center cursor-pointer"
                                        >
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">
                                                {uploading ? 'Uploading...' : 'Click to upload PDF or image (max 5MB)'}
                                            </span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <span className="flex-1 text-sm">{invoice.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeInvoice}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Transaction Items Section */}
                            <TransactionItemForm
                                items={items}
                                onChange={setItems}
                                onTotalChange={handleTotalChange}
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
                                <Button type="submit" disabled={isLoading || uploading}>
                                    {isLoading ? 'Adding...' : 'Add Transaction'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </PageLayout>
    );
}
