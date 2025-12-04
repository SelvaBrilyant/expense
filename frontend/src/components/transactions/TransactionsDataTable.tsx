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
import { ArrowUpDown, Download, Pencil, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    notes?: string;
    invoiceUrl?: string;
    items?: Array<{ id: string; name: string; quantity: number; price: number }>;
}

interface TransactionsDataTableProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
}

export function TransactionsDataTable({ transactions, onDelete }: TransactionsDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: 'date',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="text-xs sm:text-sm p-1 sm:p-2 h-auto"
                    >
                        Date
                        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <span className="text-xs sm:text-sm whitespace-nowrap">
                        {new Date(row.getValue('date')).toLocaleDateString()}
                    </span>
                );
            },
        },
        {
            accessorKey: 'title',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="text-xs sm:text-sm p-1 sm:p-2 h-auto"
                    >
                        Title
                        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const hasInvoice = row.original.invoiceUrl;
                const itemsCount = row.original.items?.length || 0;

                return (
                    <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm max-w-[100px] sm:max-w-none truncate sm:truncate-none">
                            {row.getValue('title')}
                        </span>
                        {hasInvoice && (
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                        )}
                        {itemsCount > 0 && (
                            <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap">
                                {itemsCount} items
                            </span>
                        )}
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
                        className="text-xs sm:text-sm p-1 sm:p-2 h-auto hidden sm:flex"
                    >
                        Category
                        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="hidden sm:block text-xs sm:text-sm">
                        {row.getValue('category')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="text-xs sm:text-sm p-1 sm:p-2 h-auto"
                    >
                        Type
                        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const type = row.getValue('type') as string;
                return (
                    <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap ${type === 'INCOME'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {type}
                    </span>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="text-xs sm:text-sm p-1 sm:p-2 h-auto"
                    >
                        Amount
                        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('amount'));
                const type = row.original.type;
                return (
                    <div
                        className={`font-bold text-xs sm:text-sm whitespace-nowrap ${type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(amount)}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-1">
                        <Link href={`/transactions/edit/${row.original.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => onDelete(row.original.id)}
                        >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: transactions,
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
        const exportData = transactions.map((t) => ({
            Date: new Date(t.date).toLocaleDateString(),
            Title: t.title,
            Category: t.category,
            Type: t.type,
            Amount: t.amount,
            Notes: t.notes || '',
            'Has Invoice': t.invoiceUrl ? 'Yes' : 'No',
            'Items Count': t.items?.length || 0,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `transactions-${new Date().getTime()}.xlsx`);
    };

    return (
        <div className="space-y-4">
            {/* Search and Export - Stack on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Input
                    placeholder="Search transactions..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full sm:max-w-sm"
                />
                <Button onClick={exportToExcel} variant="outline" className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                </Button>
            </div>

            {/* Table with horizontal scroll */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="px-2 sm:px-4">
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
                                        <TableCell key={cell.id} className="px-2 sm:px-4 py-2 sm:py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination - Responsive layout */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2">
                <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="text-xs sm:text-sm"
                    >
                        <ChevronLeft className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="text-xs sm:text-sm"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
