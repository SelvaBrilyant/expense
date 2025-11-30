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
import { ArrowUpDown, Download, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface RecurringTransaction {
    id: string;
    title: string;
    amount: number;
    frequency: string;
    category: string;
    nextDueDate: string;
    isActive: boolean;
    daysOfWeek?: number[];
}

interface RecurringDataTableProps {
    recurring: RecurringTransaction[];
    onDelete: (id: string) => void;
    onToggle?: (id: string) => void;
}

const DAYS_MAP: Record<number, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
};

export function RecurringDataTable({ recurring, onDelete, onToggle }: RecurringDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns: ColumnDef<RecurringTransaction>[] = [
        {
            accessorKey: 'title',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return <div className="font-medium">{row.getValue('title')}</div>;
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
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('amount'));
                return (
                    <div className="font-bold text-red-600">
                        {formatCurrency(amount)}
                    </div>
                );
            },
        },
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
                return <div>{row.getValue('category')}</div>;
            },
        },
        {
            accessorKey: 'frequency',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Frequency
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const frequency = row.getValue('frequency') as string;
                const daysOfWeek = row.original.daysOfWeek;

                return (
                    <div>
                        <div className="font-medium">{frequency}</div>
                        {daysOfWeek && daysOfWeek.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {daysOfWeek.map(d => DAYS_MAP[d]).join(', ')}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'nextDueDate',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Next Due
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return new Date(row.getValue('nextDueDate')).toLocaleDateString();
            },
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean;
                return (
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {isActive ? 'Active' : 'Paused'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const isActive = row.original.isActive;
                return (
                    <div className="flex gap-2">
                        {onToggle && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onToggle(row.original.id)}
                                title={isActive ? 'Pause' : 'Resume'}
                            >
                                {isActive ? (
                                    <ToggleRight className="h-4 w-4 text-green-500" />
                                ) : (
                                    <ToggleLeft className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        )}
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
        data: recurring,
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
        const exportData = recurring.map((r) => ({
            Title: r.title,
            Amount: r.amount,
            Category: r.category,
            Frequency: r.frequency,
            'Days of Week': r.daysOfWeek?.map(d => DAYS_MAP[d]).join(', ') || 'All',
            'Next Due Date': new Date(r.nextDueDate).toLocaleDateString(),
            Status: r.isActive ? 'Active' : 'Paused',
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Recurring');
        XLSX.writeFile(wb, `recurring-payments-${new Date().getTime()}.xlsx`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Search recurring payments..."
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
                                    No recurring payments found.
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
