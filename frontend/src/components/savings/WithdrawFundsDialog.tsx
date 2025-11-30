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
import { Loader2, Minus, AlertTriangle } from 'lucide-react';

interface WithdrawFundsDialogProps {
    saving: Saving;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WithdrawFundsDialog({ saving, open, onOpenChange }: WithdrawFundsDialogProps) {
    const { withdrawFromSaving } = useSavingsStore();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (numAmount > saving.currentAmount) {
            toast.error('Cannot withdraw more than current amount');
            return;
        }

        setIsLoading(true);
        try {
            await withdrawFromSaving(saving.id, numAmount);
            toast.success(`Withdrew ₹${numAmount.toLocaleString()} from ${saving.title}`);
            setAmount('');
            onOpenChange(false);
        } catch {
            toast.error('Failed to withdraw funds');
        } finally {
            setIsLoading(false);
        }
    };

    const newAmount = Math.max(0, saving.currentAmount - (parseFloat(amount) || 0));
    const newProgress = saving.targetAmount > 0
        ? Math.round((newAmount / saving.targetAmount) * 100)
        : 0;

    const isExceedingBalance = parseFloat(amount) > saving.currentAmount;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                        Withdraw money from your &quot;{saving.title}&quot; savings goal
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
                                max={saving.currentAmount}
                                autoFocus
                            />
                            <p className="text-sm text-gray-500">
                                Available: ₹{saving.currentAmount.toLocaleString()}
                            </p>
                        </div>

                        {amount && parseFloat(amount) > 0 && (
                            <div className={`rounded-lg p-4 space-y-2 ${isExceedingBalance
                                ? 'bg-red-50 dark:bg-red-900/20'
                                : 'bg-yellow-50 dark:bg-yellow-900/20'
                                }`}>
                                {isExceedingBalance && (
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            Amount exceeds available balance
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                                    <span className="font-medium">₹{saving.currentAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Withdrawing</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">
                                        -₹{parseFloat(amount).toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-yellow-200 dark:border-yellow-700 pt-2 mt-2" />
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>New Amount</span>
                                    <span className="text-yellow-600 dark:text-yellow-400">
                                        ₹{newAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="font-medium text-yellow-600 dark:text-yellow-400">
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
                            disabled={isLoading || !amount || parseFloat(amount) <= 0 || isExceedingBalance}
                            variant="destructive"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Withdrawing...
                                </>
                            ) : (
                                <>
                                    <Minus className="mr-2 h-4 w-4" />
                                    Withdraw
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
