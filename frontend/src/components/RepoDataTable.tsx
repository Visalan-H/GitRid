import { useState, useEffect, useMemo } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Repository } from '@/pages/Repositories';
import { toast } from 'sonner';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps {
    columns: ColumnDef<Repository>[];
    data: Repository[];
    onSelectionChange: (repos: Repository[]) => void;
}

export function RepoDataTable({ columns, data, onSelectionChange }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const uniqueLanguages = Array.from(
        new Set(data.map(repo => repo.language).filter(Boolean))
    ).sort() as string[];

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
        defaultColumn: {
            size: 150,
            minSize: 50,
            maxSize: 500,
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

    const getColumnWidth = useMemo(
        () => (columnId: string) => {
            switch (columnId) {
                case 'select':
                    return 50;
                case 'name':
                    return 400;
                case 'language':
                    return 150;
                case 'stars':
                    return 100;
                case 'forks':
                    return 100;
                case 'updatedAt':
                    return 180;
                default:
                    return undefined;
            }
        },
        []
    );

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center py-4 gap-4">
                <Input
                    placeholder="Search repositories..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={event => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="w-full md:max-w-sm bg-black border-[#ededed]/20 text-[#ededed] placeholder:text-[#ededed]/40 focus-visible:ring-[#ededed]/30"
                />
                <Select
                    value={(table.getColumn('language')?.getFilterValue() as string) ?? 'all'}
                    onValueChange={value => {
                        table.getColumn('language')?.setFilterValue(value === 'all' ? '' : value);
                    }}
                >
                    <SelectTrigger className="w-full md:w-[180px] bg-black border-[#ededed]/20 text-[#ededed]">
                        <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#ededed]/20">
                        <SelectItem value="all" className="text-[#ededed]">
                            All Languages
                        </SelectItem>
                        {uniqueLanguages.map(lang => (
                            <SelectItem key={lang} value={lang} className="text-[#ededed]">
                                {lang}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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

            <div className="rounded-lg border border-[#ededed]/10 overflow-hidden bg-black custom-scrollbar overflow-auto">
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-[#ededed]/10 hover:bg-[#ededed]/5"
                            >
                                {headerGroup.headers.map(header => {
                                    const canSort =
                                        header.column.getCanSort() &&
                                        header.column.id !== 'language';
                                    const width = getColumnWidth(header.column.id);
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="text-[#ededed]/80 font-semibold bg-[#ededed]/5"
                                            onClick={() => canSort && header.column.toggleSorting()}
                                            style={{
                                                cursor: canSort ? 'pointer' : undefined,
                                                width: width ? `${width}px` : undefined,
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                                {canSort && (
                                                    <>
                                                        {header.column.getIsSorted() === 'asc' ? (
                                                            <ArrowUp className="h-4 w-4" />
                                                        ) : header.column.getIsSorted() ===
                                                          'desc' ? (
                                                            <ArrowDown className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </TableHead>
                                    );
                                })}
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
                                        <TableCell
                                            key={cell.id}
                                            className="text-[#ededed] overflow-hidden"
                                        >
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
