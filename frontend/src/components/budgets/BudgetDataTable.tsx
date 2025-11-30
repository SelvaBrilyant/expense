'use client';
'use no memo';

import { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, Download, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { BudgetWithSpending } from '@/store/budgetStore';
import { Progress } from '@/components/ui/progress';

interface BudgetDataTableProps {
    budgets: BudgetWithSpending[];
    onDelete: (id: string) => void;
    onEdit: (budget: BudgetWithSpending) => void;
}

export function BudgetDataTable({ budgets, onDelete, onEdit }: BudgetDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON_TRACK':
                return 'text-green-600';
            case 'WARNING':
                return 'text-yellow-600';
            case 'CRITICAL':
                return 'text-orange-600';
            case 'OVER':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };



    const columns: ColumnDef<BudgetWithSpending>[] = [
        {
            accessorKey: 'category',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Category
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return <div className="font-medium">{row.getValue('category')}</div>;
            },
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Budget
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return <div className="font-bold">{formatCurrency(row.getValue('amount'))}</div>;
            },
        },
        {
            accessorKey: 'spent',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Spent
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return <div className="text-red-600 font-semibold">{formatCurrency(row.getValue('spent'))}</div>;
            },
        },
        {
            accessorKey: 'remaining',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Remaining
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const remaining = row.getValue('remaining') as number;
                return (
                    <div className={remaining < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {formatCurrency(Math.abs(remaining))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'percentage',
            header: 'Progress',
            cell: ({ row }) => {
                const percentage = row.getValue('percentage') as number;
                return (
                    <div className="w-full">
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Progress value={Math.min(percentage, 100)} className="h-2" />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <span className={`font-medium ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            accessorKey: 'daysLeft',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Days Left
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return <div className="text-center">{row.getValue('daysLeft')}</div>;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(row.original)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: budgets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const exportToExcel = () => {
        const exportData = budgets.map((b) => ({
            Category: b.category,
            Budget: b.amount,
            Spent: b.spent,
            Remaining: b.remaining,
            'Percentage Used': `${b.percentage}%`,
            Status: b.status,
            'Days Left': b.daysLeft,
            Period: b.period,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Budgets');
        XLSX.writeFile(wb, `budgets-${new Date().getTime()}.xlsx`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Search budgets..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={exportToExcel} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No budgets found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
