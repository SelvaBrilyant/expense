'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSavingsStore, type SavingCategory, type SavingPriority } from '@/store/savingsStore';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AddSavingPage() {
    const router = useRouter();
    const { createSaving, isLoading } = useSavingsStore();

    const [formData, setFormData] = useState({
        title: '',
        targetAmount: '',
        currentAmount: '',
        category: 'OTHER' as SavingCategory,
        priority: 'MEDIUM' as SavingPriority,
        deadline: '',
        notes: '',
    });

    const handleChange = (field: string, value: string) => {
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
            await createSaving({
                title: formData.title,
                targetAmount,
                currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : undefined,
                category: formData.category,
                priority: formData.priority,
                deadline: formData.deadline || undefined,
                notes: formData.notes || undefined,
            });

            toast.success('Savings goal created successfully!');
            router.push('/savings');
        } catch {
            toast.error('Failed to create savings goal');
        }
    };

    return (
        <PageLayout
            title="Create Savings Goal"
            description="Set a new savings goal and start building your financial future"
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
                            <p className="text-sm text-gray-500">Leave blank to start from zero</p>
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

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/savings')}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Create Goal
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
