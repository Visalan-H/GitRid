import { useState, useEffect } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Repository } from '@/pages/Repositories';
import { toast } from 'sonner';

interface DataTableProps {
    columns: ColumnDef<Repository>[];
    data: Repository[];
    onSelectionChange: (repos: Repository[]) => void;
}

export function RepoDataTable({ columns, data, onSelectionChange }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: updater => {
            const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
            const selectedCount = Object.keys(newSelection).filter(key => newSelection[key]).length;

            if (selectedCount > 50) {
                toast.error('Maximum 50 repositories can be selected at once');
                return;
            }
            setRowSelection(newSelection);
        },
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    });

    useEffect(() => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedRepos = selectedRows.map(row => row.original);
        onSelectionChange(selectedRepos);
    }, [rowSelection, onSelectionChange, table]);

    return (
        <div className="w-full">
            {/* Filter */}
            <div className="flex items-center py-4 gap-4">
                <Input
                    placeholder="Search repositories..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={event => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="max-w-sm bg-black border-[#ededed]/20 text-[#ededed] placeholder:text-[#ededed]/40 focus-visible:ring-[#ededed]/30"
                />
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="text-sm text-[#ededed]/60">
                        {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected
                        {table.getFilteredSelectedRowModel().rows.length > 50 && (
                            <span className="text-red-500 ml-2 font-medium">(Max 50 allowed)</span>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-[#ededed]/10 overflow-hidden bg-black">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-[#ededed]/10 hover:bg-[#ededed]/5"
                            >
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        className="text-[#ededed]/80 font-semibold bg-[#ededed]/5"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="border-[#ededed]/10 hover:bg-[#ededed]/5 data-[state=selected]:bg-[#ededed]/10"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="text-[#ededed]">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-[#ededed]/60"
                                >
                                    No repositories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="bg-black border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10 hover:text-[#ededed] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="bg-black border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10 hover:text-[#ededed] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
