'use client';

import { useEffect, useState } from 'react';
import { useSavingsStore } from '@/store/savingsStore';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SavingCard } from '@/components/savings/SavingCard';

export default function SavingsPage() {
    const { savings, isLoading, fetchSavings } = useSavingsStore();
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const filters: Record<string, string | boolean> = {};
        if (categoryFilter !== 'all') filters.category = categoryFilter;
        if (priorityFilter !== 'all') filters.priority = priorityFilter;
        if (statusFilter !== 'all') filters.isCompleted = statusFilter === 'completed';

        fetchSavings(filters);
    }, [categoryFilter, priorityFilter, statusFilter, fetchSavings]);

    // Calculate stats
    const totalSaved = savings.reduce((sum, s) => sum + s.currentAmount, 0);
    const totalTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0);
    const activeGoals = savings.filter(s => !s.isCompleted).length;
    const completedGoals = savings.filter(s => s.isCompleted).length;

    return (
        <PageLayout
            title="Savings Goals"
            description="Track and manage your savings goals"
            action={
                <Link href="/savings/add">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Savings Goal
                    </Button>
                </Link>
            }
        >
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card className="border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Saved</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    ₹{totalSaved.toLocaleString()}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Target</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ₹{totalTarget.toLocaleString()}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Goals</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {activeGoals}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-indigo-200 dark:border-indigo-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {completedGoals}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
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

                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">Priority</label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Goals</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Savings Goals Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : savings.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No savings goals yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start building your financial future by creating your first savings goal.
                        </p>
                        <Link href="/savings/add">
                            <Button className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Goal
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savings.map((saving) => (
                        <SavingCard key={saving.id} saving={saving} />
                    ))}
                </div>
            )}
        </PageLayout>
    );
}
