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
import { InvoiceScanModal, ParsedInvoiceData } from '@/components/transactions/InvoiceScanModal';
import { Upload, FileText, X, Sparkles, ScanLine } from 'lucide-react';
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
    const [scanModalOpen, setScanModalOpen] = useState(false);

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

    // Handle data extracted from scanned invoice
    const handleInvoiceDataExtracted = (data: ParsedInvoiceData) => {
        form.setValue('title', data.title);
        form.setValue('amount', data.amount.toString());
        form.setValue('type', data.type);
        form.setValue('category', data.category);
        form.setValue('paymentMethod', data.paymentMethod);
        form.setValue('date', data.date);
        form.setValue('notes', data.notes);

        // Set items if present
        if (data.items && data.items.length > 0) {
            setItems(data.items);
        }
    };

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
            {/* Invoice Scan Modal */}
            <InvoiceScanModal
                open={scanModalOpen}
                onClose={() => setScanModalOpen(false)}
                onDataExtracted={handleInvoiceDataExtracted}
            />

            <Card className="">
                <CardContent className="pt-6">
                    {/* Scan Invoice Button */}
                    <div className="mb-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setScanModalOpen(true)}
                            className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-950/50 dark:hover:to-blue-950/50 transition-all duration-300"
                        >
                            <ScanLine className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                                Scan Invoice with AI
                            </span>
                            <Sparkles className="h-4 w-4 ml-2 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                            Upload an invoice or receipt to auto-fill all fields
                        </p>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
                                or enter manually
                            </span>
                        </div>
                    </div>

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
