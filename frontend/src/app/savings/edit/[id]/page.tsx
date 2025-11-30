'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSavingsStore, type SavingCategory, type SavingPriority } from '@/store/savingsStore';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditSavingPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { getSavingById, updateSaving, deleteSaving, isLoading } = useSavingsStore();

    const [formData, setFormData] = useState({
        title: '',
        targetAmount: '',
        currentAmount: '',
        category: 'OTHER' as SavingCategory,
        priority: 'MEDIUM' as SavingPriority,
        deadline: '',
        notes: '',
        isCompleted: false,
    });

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadSaving = async () => {
            const saving = await getSavingById(id);
            if (saving) {
                setFormData({
                    title: saving.title,
                    targetAmount: saving.targetAmount.toString(),
                    currentAmount: saving.currentAmount.toString(),
                    category: saving.category,
                    priority: saving.priority,
                    deadline: saving.deadline ? new Date(saving.deadline).toISOString().split('T')[0] : '',
                    notes: saving.notes || '',
                    isCompleted: saving.isCompleted,
                });
            } else {
                toast.error('Savings goal not found');
                router.push('/savings');
            }
            setIsLoadingData(false);
        };

        loadSaving();
    }, [id, getSavingById, router]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        const targetAmount = parseFloat(formData.targetAmount);
        if (isNaN(targetAmount) || targetAmount <= 0) {
            toast.error('Please enter a valid target amount');
            return;
        }

        try {
            await updateSaving(id, {
                title: formData.title,
                targetAmount,
                currentAmount: parseFloat(formData.currentAmount),
                category: formData.category,
                priority: formData.priority,
                deadline: formData.deadline || undefined,
                notes: formData.notes || undefined,
                isCompleted: formData.isCompleted,
            });

            toast.success('Savings goal updated successfully!');
            router.push('/savings');
        } catch {
            toast.error('Failed to update savings goal');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this savings goal? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteSaving(id);
            toast.success('Savings goal deleted successfully');
            router.push('/savings');
        } catch {
            toast.error('Failed to delete savings goal');
            setIsDeleting(false);
        }
    };

    if (isLoadingData) {
        return (
            <PageLayout title="Edit Savings Goal" description="Loading...">
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Edit Savings Goal"
            description="Update your savings goal details"
            action={
                <Link href="/savings">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Savings
                    </Button>
                </Link>
            }
        >
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Savings Goal Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Emergency Fund, Vacation to Europe"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                            />
                        </div>

                        {/* Target Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="targetAmount">Target Amount (₹) *</Label>
                            <Input
                                id="targetAmount"
                                type="number"
                                step="0.01"
                                placeholder="e.g., 100000"
                                value={formData.targetAmount}
                                onChange={(e) => handleChange('targetAmount', e.target.value)}
                                required
                            />
                        </div>

                        {/* Current Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="currentAmount">Current Amount (₹)</Label>
                            <Input
                                id="currentAmount"
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={formData.currentAmount}
                                onChange={(e) => handleChange('currentAmount', e.target.value)}
                            />
                        </div>

                        {/* Category & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange('category', value)}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                        <SelectItem value="VACATION">Vacation</SelectItem>
                                        <SelectItem value="EDUCATION">Education</SelectItem>
                                        <SelectItem value="HOME">Home</SelectItem>
                                        <SelectItem value="CAR">Car</SelectItem>
                                        <SelectItem value="INVESTMENT">Investment</SelectItem>
                                        <SelectItem value="RETIREMENT">Retirement</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => handleChange('priority', value)}
                                >
                                    <SelectTrigger id="priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Target Date (Optional)</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any additional notes about this savings goal..."
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Completed Checkbox */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isCompleted"
                                checked={formData.isCompleted}
                                onCheckedChange={(checked) => handleChange('isCompleted', checked as boolean)}
                            />
                            <Label
                                htmlFor="isCompleted"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Mark as completed
                            </Label>
                        </div>

                        {/* Progress Info */}
                        <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Current Progress</span>
                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    {Math.round((parseFloat(formData.currentAmount) / parseFloat(formData.targetAmount)) * 100) || 0}%
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                ₹{parseFloat(formData.currentAmount || '0').toLocaleString()} of ₹{parseFloat(formData.targetAmount || '0').toLocaleString()}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isLoading || isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </>
                                )}
                            </Button>
                            <div className="flex-1" />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/savings')}
                                disabled={isLoading || isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || isDeleting}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Goal
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </PageLayout>
    );
}
