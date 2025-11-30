'use client';

import { useState } from 'react';
import { type Saving, useSavingsStore } from '@/store/savingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Edit,
    Trash2,
    Plus,
    Minus,
    Calendar,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { AddFundsDialog } from './AddFundsDialog';
import { WithdrawFundsDialog } from './WithdrawFundsDialog';

const categoryColors: Record<string, string> = {
    EMERGENCY: 'from-red-500 to-orange-500',
    VACATION: 'from-blue-500 to-cyan-500',
    EDUCATION: 'from-purple-500 to-pink-500',
    HOME: 'from-green-500 to-emerald-500',
    CAR: 'from-gray-500 to-slate-600',
    INVESTMENT: 'from-yellow-500 to-amber-500',
    RETIREMENT: 'from-indigo-500 to-purple-600',
    OTHER: 'from-pink-500 to-rose-500',
};

const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

interface SavingCardProps {
    saving: Saving;
}

export function SavingCard({ saving }: SavingCardProps) {
    const { deleteSaving } = useSavingsStore();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const progress = saving.targetAmount > 0
        ? Math.min(100, Math.round((saving.currentAmount / saving.targetAmount) * 100))
        : 0;

    const daysUntilDeadline = saving.deadline
        ? Math.ceil((new Date(saving.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
    const isApproachingDeadline = daysUntilDeadline !== null && daysUntilDeadline > 0 && daysUntilDeadline <= 30;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this savings goal?')) return;

        setIsDeleting(true);
        try {
            await deleteSaving(saving.id);
            toast.success('Savings goal deleted successfully');
        } catch {
            toast.error('Failed to delete savings goal');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddSuccess = () => {
        setShowAddDialog(false);
        if (progress >= 100) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#7c3aed', '#6d28d9', '#a78bfa']
            });
            toast.success('🎉 Congratulations! You achieved your savings goal!');
        }
    };

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${categoryColors[saving.category]}`} />

                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                {saving.title}
                                {saving.isCompleted && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                    {saving.category.charAt(0) + saving.category.slice(1).toLowerCase()}
                                </Badge>
                                <Badge className={priorityColors[saving.priority]}>
                                    {saving.priority}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {progress}%
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">₹{saving.currentAmount.toLocaleString()}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                                of ₹{saving.targetAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Deadline */}
                    {saving.deadline && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className={
                                isOverdue
                                    ? 'text-red-600 dark:text-red-400 font-medium'
                                    : isApproachingDeadline
                                        ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-400'
                            }>
                                {isOverdue
                                    ? `Overdue by ${Math.abs(daysUntilDeadline!)} days`
                                    : isApproachingDeadline
                                        ? `${daysUntilDeadline} days left`
                                        : new Date(saving.deadline).toLocaleDateString()
                                }
                            </span>
                            {(isOverdue || isApproachingDeadline) && (
                                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    {saving.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {saving.notes}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {!saving.isCompleted && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowAddDialog(true)}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                                {saving.currentAmount > 0 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowWithdrawDialog(true)}
                                    >
                                        <Minus className="h-4 w-4 mr-1" />
                                        Withdraw
                                    </Button>
                                )}
                            </>
                        )}
                        <Link href={`/savings/edit/${saving.id}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AddFundsDialog
                saving={saving}
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={handleAddSuccess}
            />

            <WithdrawFundsDialog
                saving={saving}
                open={showWithdrawDialog}
                onOpenChange={setShowWithdrawDialog}
            />
        </>
    );
}
