'use client';

import { useState } from 'react';
import { type Saving, useSavingsStore } from '@/store/savingsStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface AddFundsDialogProps {
    saving: Saving;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddFundsDialog({ saving, open, onOpenChange, onSuccess }: AddFundsDialogProps) {
    const { addToSaving } = useSavingsStore();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        try {
            await addToSaving(saving.id, numAmount);
            toast.success(`Added ₹${numAmount.toLocaleString()} to ${saving.title}`);
            setAmount('');
            onSuccess?.();
        } catch {
            toast.error('Failed to add funds');
        } finally {
            setIsLoading(false);
        }
    };

    const newAmount = saving.currentAmount + (parseFloat(amount) || 0);
    const newProgress = saving.targetAmount > 0
        ? Math.min(100, Math.round((newAmount / saving.targetAmount) * 100))
        : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Funds</DialogTitle>
                    <DialogDescription>
                        Add money to your &quot;{saving.title}&quot; savings goal
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {amount && parseFloat(amount) > 0 && (
                            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                                    <span className="font-medium">₹{saving.currentAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Adding</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        +₹{parseFloat(amount).toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-purple-200 dark:border-purple-700 pt-2 mt-2" />
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>New Amount</span>
                                    <span className="text-purple-600 dark:text-purple-400">
                                        ₹{newAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="font-medium text-purple-600 dark:text-purple-400">
                                        {newProgress}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !amount || parseFloat(amount) <= 0}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Funds
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
