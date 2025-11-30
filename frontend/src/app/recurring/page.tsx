'use client';

import { useEffect, useState } from 'react';
import { useRecurringStore } from '@/store/recurringStore';
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

export default function RecurringPage() {
    const { recurring, fetchRecurring, addRecurring, deleteRecurring, isLoading } =
        useRecurringStore();
    const [isOpen, setIsOpen] = useState(false);
    const [newRecurring, setNewRecurring] = useState({
        title: '',
        amount: '',
        frequency: 'MONTHLY',
        nextDueDate: '',
    });

    useEffect(() => {
        // fetchRecurring(); // Uncomment when backend route is ready
    }, [fetchRecurring]);

    const handleAddRecurring = async () => {
        if (!newRecurring.title || !newRecurring.amount || !newRecurring.nextDueDate) {
            toast.error('Please fill all fields');
            return;
        }
        await addRecurring({
            ...newRecurring,
            amount: parseFloat(newRecurring.amount),
        });
        setIsOpen(false);
        setNewRecurring({ title: '', amount: '', frequency: 'MONTHLY', nextDueDate: '' });
        toast.success('Recurring transaction added');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Stop this recurring payment?')) {
            await deleteRecurring(id);
            toast.success('Recurring payment stopped');
        }
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen dark:bg-gray-900">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Recurring Payments</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Recurring
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Recurring Payment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="Netflix Subscription"
                                    value={newRecurring.title}
                                    onChange={(e) =>
                                        setNewRecurring({ ...newRecurring, title: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <Input
                                    type="number"
                                    placeholder="199"
                                    value={newRecurring.amount}
                                    onChange={(e) =>
                                        setNewRecurring({ ...newRecurring, amount: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Frequency</label>
                                <Select
                                    value={newRecurring.frequency}
                                    onValueChange={(val) =>
                                        setNewRecurring({ ...newRecurring, frequency: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Daily</SelectItem>
                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="YEARLY">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Next Due Date</label>
                                <Input
                                    type="date"
                                    value={newRecurring.nextDueDate}
                                    onChange={(e) =>
                                        setNewRecurring({ ...newRecurring, nextDueDate: e.target.value })
                                    }
                                />
                            </div>
                            <Button onClick={handleAddRecurring} className="w-full">
                                Save Recurring Payment
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <p>Loading...</p>
                ) : recurring.length === 0 ? (
                    <p>No recurring payments found.</p>
                ) : (
                    recurring.map((r) => (
                        <Card key={r.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{r.title}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(r.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{r.amount}</div>
                                <p className="text-xs text-muted-foreground">
                                    {r.frequency.toLowerCase()} • Next due: {new Date(r.nextDueDate).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
