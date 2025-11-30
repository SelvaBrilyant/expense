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
import { PageLayout } from '@/components/layout/PageLayout';
import { DEFAULT_CATEGORIES } from '@/lib/categoryConstants';

export default function RecurringPage() {
    const { recurringTransactions: recurring, fetchRecurring, addRecurring, deleteRecurring, isLoading } =
        useRecurringStore();
    const [isOpen, setIsOpen] = useState(false);
    const [newRecurring, setNewRecurring] = useState({
        title: '',
        amount: '',
        category: 'Bills',
        frequency: 'MONTHLY',
        nextDueDate: '',
    });
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    useEffect(() => {
        // fetchRecurring(); // Uncomment when backend route is ready
    }, [fetchRecurring]);

    const handleAddRecurring = async () => {
        if (!newRecurring.title || !newRecurring.amount || !newRecurring.nextDueDate || !newRecurring.category) {
            toast.error('Please fill all fields');
            return;
        }
        await addRecurring({
            title: newRecurring.title,
            amount: parseFloat(newRecurring.amount),
            category: newRecurring.category,
            frequency: newRecurring.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
            startDate: newRecurring.nextDueDate,
            daysOfWeek: selectedDays.length > 0 ? selectedDays : undefined,
        });
        setIsOpen(false);
        setNewRecurring({ title: '', amount: '', category: 'Bills', frequency: 'MONTHLY', nextDueDate: '' });
        setSelectedDays([]);
        toast.success('Recurring transaction added');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Stop this recurring payment?')) {
            await deleteRecurring(id);
            toast.success('Recurring payment stopped');
        }
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
        );
    };

    const quickSelectWeekdays = () => setSelectedDays([1, 2, 3, 4, 5]); // Mon-Fri
    const quickSelectWeekends = () => setSelectedDays([0, 6]); // Sun, Sat
    const quickSelectAllDays = () => setSelectedDays([]);

    const DAYS = [
        { value: 1, label: 'Mon' },
        { value: 2, label: 'Tue' },
        { value: 3, label: 'Wed' },
        { value: 4, label: 'Thu' },
        { value: 5, label: 'Fri' },
        { value: 6, label: 'Sat' },
        { value: 0, label: 'Sun' },
    ];

    const showDaySelector = newRecurring.frequency === 'DAILY' || newRecurring.frequency === 'WEEKLY';

    return (
        <PageLayout
            title="Recurring Payments"
            action={
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
                                <label className="text-sm font-medium">Category</label>
                                <Select
                                    value={newRecurring.category}
                                    onValueChange={(val) =>
                                        setNewRecurring({ ...newRecurring, category: val })
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

                            {/* Day of Week Selector */}
                            {showDaySelector && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Days of the Week</label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {DAYS.map((day) => (
                                                <Button
                                                    key={day.value}
                                                    type="button"
                                                    variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => toggleDay(day.value)}
                                                    className="w-14"
                                                >
                                                    {day.label}
                                                </Button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={quickSelectWeekdays}
                                                className="text-xs"
                                            >
                                                Weekdays
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={quickSelectWeekends}
                                                className="text-xs"
                                            >
                                                Weekends
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={quickSelectAllDays}
                                                className="text-xs"
                                            >
                                                All Days
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

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
            }
        >
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
        </PageLayout>
    );
}
