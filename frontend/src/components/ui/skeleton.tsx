'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted/60',
                className
            )}
            {...props}
        />
    );
}

// Card Skeleton for dashboard summary cards
export function CardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

// Quick Stats Card Skeleton
export function QuickStatsSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-6 w-20 mb-2" />
                        <Skeleton className="h-3 w-14" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Chart Skeleton
export function ChartSkeleton({ className }: { className?: string }) {
    // Predefined heights for consistent rendering
    const barHeights = [65, 40, 80, 55, 45, 70, 50];

    return (
        <div className={cn('rounded-lg border bg-card p-6', className)}>
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex items-end justify-center gap-2 h-[300px]">
                {barHeights.map((height, i) => (
                    <Skeleton
                        key={i}
                        className="w-8 rounded-t-md"
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-t">
            {[...Array(columns)].map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
            ))}
        </tr>
    );
}

// Full Table Skeleton
export function TableSkeleton({
    rows = 5,
    columns = 5,
    showSearch = true,
    showPagination = true,
}: {
    rows?: number;
    columns?: number;
    showSearch?: boolean;
    showPagination?: boolean;
}) {
    return (
        <div className="space-y-4">
            {/* Search Skeleton */}
            {showSearch && (
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[320px]" />
                </div>
            )}

            {/* Table Skeleton */}
            <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            {[...Array(columns)].map((_, i) => (
                                <th key={i} className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(rows)].map((_, i) => (
                            <TableRowSkeleton key={i} columns={columns} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Skeleton */}
            {showPagination && (
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-20 rounded-md" />
                    </div>
                </div>
            )}
        </div>
    );
}

// Transaction List Skeleton (for recent transactions in dashboard)
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center">
                    <div className="ml-4 space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

// Widget Skeleton (for budget/recurring widgets)
export function WidgetSkeleton() {
    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
                <Skeleton className="h-5 w-36" />
            </div>
            <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// AI Advisor Skeleton
export function AIAdvisorSkeleton() {
    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6 border-b flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-24" />
            </div>
            <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
}

// Insights Skeleton
export function InsightsSkeleton() {
    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Full Dashboard Skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Filter Card Skeleton */}
            <div className="rounded-lg border-2 bg-gradient-to-br from-primary/5 via-background to-background p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-10" />
                            <Skeleton className="h-10 w-[160px]" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-10" />
                            <Skeleton className="h-10 w-[120px]" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-10 opacity-0" />
                            <Skeleton className="h-10 w-[130px]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>

            {/* Quick Stats Skeleton */}
            <QuickStatsSkeleton />

            {/* Two Column Widgets */}
            <div className="grid gap-6 md:grid-cols-2">
                <InsightsSkeleton />
                <InsightsSkeleton />
            </div>

            {/* Budget and Recurring Widgets */}
            <div className="grid gap-6 md:grid-cols-2">
                <WidgetSkeleton />
                <WidgetSkeleton />
            </div>

            {/* Charts Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            {/* AI Advisor + Recent Transactions */}
            <div className="grid gap-4 md:grid-cols-7">
                <div className="col-span-4">
                    <AIAdvisorSkeleton />
                </div>
                <div className="col-span-3">
                    <div className="rounded-lg border bg-card">
                        <div className="p-6 border-b">
                            <Skeleton className="h-5 w-36" />
                        </div>
                        <div className="p-6">
                            <TransactionListSkeleton count={5} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Budget Card Skeleton (for budget cards view)
export function BudgetCardSkeleton() {
    return (
        <div className="rounded-lg border-2 bg-card">
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex gap-1">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-8 w-14" />
                    </div>
                </div>
            </div>
            <div className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-14" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-4 w-14" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-14" />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-16 rounded" />
                </div>
            </div>
        </div>
    );
}

// Budget Cards Grid Skeleton
export function BudgetCardsGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(count)].map((_, i) => (
                <BudgetCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Recurring Card Skeleton
export function RecurringCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
            </div>
        </div>
    );
}

// Recurring List Skeleton
export function RecurringListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(count)].map((_, i) => (
                <RecurringCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Savings Goal Card Skeleton
export function SavingsCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex gap-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-9 w-full" />
            </div>
        </div>
    );
}

// Savings Grid Skeleton
export function SavingsGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(count)].map((_, i) => (
                <SavingsCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Page Loading Skeleton (generic full-page loader with custom content)
export function PageLoadingSkeleton({
    children,
    showFilters = true
}: {
    children?: React.ReactNode;
    showFilters?: boolean;
}) {
    return (
        <div className="space-y-6">
            {showFilters && (
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>
            )}
            {children}
        </div>
    );
}

