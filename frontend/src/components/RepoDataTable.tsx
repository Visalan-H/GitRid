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
        onRowSelectionChange: setRowSelection,
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
        <div>
            {/* Filter */}
            <div className="flex items-center py-4 gap-4">
                <Input
                    placeholder="Filter repositories..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={event => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="max-w-sm bg-[#0a0a0a] border-[#ededed]/20 text-[#ededed] placeholder:text-[#ededed]/40"
                />
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="text-sm text-[#ededed]/60">
                        {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected
                        {table.getFilteredSelectedRowModel().rows.length > 50 && (
                            <span className="text-red-500 ml-2">(Max 50 allowed)</span>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-[#ededed]/10 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-[#ededed]/10 hover:bg-[#0a0a0a]"
                            >
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} className="text-[#ededed]/80">
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
                                    className="border-[#ededed]/10 hover:bg-[#0a0a0a]"
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
                    className="border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
