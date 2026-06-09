import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ColumnDef,
    Row,
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

// Fixed fallbacks for initialization or empty states
const FALLBACK_ROW_H = 65;
const FALLBACK_HEADER_H = 41;

const getColumnWidth = (columnId: string): number | undefined => {
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
};

export function RepoDataTable({ columns, data, onSelectionChange }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);

    const lastClickedRowIndexRef = useRef<number | null>(null);
    const measureWrapperRef = useRef<HTMLDivElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<ReturnType<typeof useReactTable<Repository>> | null>(null);

    // ─── Precision Layout Calculation ──────────────────────────────────────────
    const calculatePageSize = useCallback(() => {
        const parent = measureWrapperRef.current;
        if (!parent) return;

        const headerRow = parent.querySelector('thead tr');
        const firstRow = parent.querySelector('tbody tr');

        const hdrH = headerRow
            ? Math.ceil(headerRow.getBoundingClientRect().height)
            : FALLBACK_HEADER_H;
        const rowH = firstRow
            ? Math.round(firstRow.getBoundingClientRect().height)
            : FALLBACK_ROW_H;

        const availableHeight = parent.clientHeight;

        // Determine exactly how many fixed-height rows can fit cleanly
        const targetRows = Math.max(1, Math.floor((availableHeight - hdrH) / rowH));

        tableRef.current?.setPageSize(targetRows);

        // Dynamically clamp the bordered container to snap directly around the visible rows
        setTableHeight(hdrH + targetRows * rowH);
    }, []);

    // Monitor outer layout bounds safely using a ResizeObserver on the wrapper
    useEffect(() => {
        const el = measureWrapperRef.current;
        if (!el) return;

        calculatePageSize();

        const ro = new ResizeObserver(() => {
            requestAnimationFrame(calculatePageSize);
        });
        ro.observe(el);

        return () => ro.disconnect();
    }, [calculatePageSize]);

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
        defaultColumn: { size: 150, minSize: 50, maxSize: 500 },
        state: { sorting, columnFilters, rowSelection },
    });
    tableRef.current = table;

    const currentPage = table.getState().pagination.pageIndex;
    const totalPages = table.getPageCount();

    // Re-verify layout measurements immediately following navigation or filter changes
    useEffect(() => {
        const id = requestAnimationFrame(calculatePageSize);
        return () => cancelAnimationFrame(id);
    }, [currentPage, columnFilters, calculatePageSize]);

    const handleRowClick = (event: React.MouseEvent, rowIndex: number, row: Row<Repository>) => {
        if (event.shiftKey && lastClickedRowIndexRef.current !== null) {
            event.preventDefault();
            const visibleRows = table.getRowModel().rows;
            const start = Math.min(lastClickedRowIndexRef.current, rowIndex);
            const end = Math.max(lastClickedRowIndexRef.current, rowIndex);
            const newSelection = { ...rowSelection };
            for (let i = start; i <= end; i++) {
                if (visibleRows[i]) newSelection[visibleRows[i].id] = true;
            }
            const selectedCount = Object.values(newSelection).filter(Boolean).length;
            if (selectedCount > 50) {
                toast.error('Maximum 50 repositories can be selected at once');
                return;
            }
            setRowSelection(newSelection);
            return;
        }

        const target = event.target as HTMLElement;
        if (target.closest('button[role="checkbox"]')) {
            lastClickedRowIndexRef.current = rowIndex;
            return;
        }

        row.toggleSelected();
        lastClickedRowIndexRef.current = rowIndex;
    };

    const uniqueLanguages = Array.from(
        new Set(data.map(repo => repo.language).filter(Boolean))
    ).sort() as string[];

    useEffect(() => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        onSelectionChange(selectedRows.map(row => row.original));
    }, [rowSelection, onSelectionChange, table]);

    return (
        <div className="h-full flex flex-col">
            {/* Filters Section */}
            <div className="flex-none flex flex-col md:flex-row items-start md:items-center py-4 gap-4">
                <Input
                    placeholder="Search repositories..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={e => table.getColumn('name')?.setFilterValue(e.target.value)}
                    className="w-full md:max-w-sm border text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)]"
                    style={{
                        backgroundColor: 'var(--app-bg)',
                        borderColor: 'var(--app-border)',
                    }}
                />
                <Select
                    value={(table.getColumn('language')?.getFilterValue() as string) ?? 'all'}
                    onValueChange={value =>
                        table.getColumn('language')?.setFilterValue(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger
                        className="w-full md:w-[180px] border text-[var(--app-fg)]"
                        style={{
                            backgroundColor: 'var(--app-bg)',
                            borderColor: 'var(--app-border)',
                        }}
                    >
                        <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent
                        className="border"
                        style={{
                            backgroundColor: 'var(--app-bg)',
                            borderColor: 'var(--app-border)',
                        }}
                    >
                        <SelectItem value="all" className="text-[var(--app-fg)]">
                            All Languages
                        </SelectItem>
                        {uniqueLanguages.map(lang => (
                            <SelectItem key={lang} value={lang} className="text-[var(--app-fg)]">
                                {lang}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="text-sm text-[var(--app-fg-muted)]">
                        {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} selected
                        {table.getFilteredSelectedRowModel().rows.length > 50 && (
                            <span className="text-red-500 ml-2 font-medium">(Max 50 allowed)</span>
                        )}
                    </div>
                )}
            </div>

            {/* Stable Layout Container */}
            <div ref={measureWrapperRef} className="flex-1 min-h-0 w-full">
                <div
                    ref={tableContainerRef}
                    className="overflow-hidden rounded-lg border transition-[height] duration-75 ease-out"
                    style={{
                        borderColor: 'var(--app-border)',
                        height: tableHeight ? `${tableHeight}px` : '100%',
                    }}
                >
                    <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow
                                    key={headerGroup.id}
                                    className="border-b hover:bg-transparent"
                                    style={{
                                        borderColor: 'var(--app-border)',
                                        backgroundColor: 'var(--app-fg-subtle)',
                                    }}
                                >
                                    {headerGroup.headers.map(header => {
                                        const canSort =
                                            header.column.getCanSort() &&
                                            header.column.id !== 'language';
                                        const width = getColumnWidth(header.column.id);
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className="font-semibold"
                                                style={{
                                                    color: 'var(--app-fg)',
                                                    cursor: canSort ? 'pointer' : undefined,
                                                    width: width ? `${width}px` : undefined,
                                                }}
                                                onClick={() =>
                                                    canSort && header.column.toggleSorting()
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                    {canSort &&
                                                        (header.column.getIsSorted() === 'asc' ? (
                                                            <ArrowUp className="h-4 w-4" />
                                                        ) : header.column.getIsSorted() ===
                                                          'desc' ? (
                                                            <ArrowDown className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row, rowIndex) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className="border-b cursor-pointer select-none transition-colors"
                                        style={{
                                            borderColor: 'var(--app-border)',
                                            backgroundColor: row.getIsSelected()
                                                ? 'var(--app-fg-subtle)'
                                                : undefined,
                                        }}
                                        onClick={e => handleRowClick(e, rowIndex, row)}
                                        onMouseEnter={e => {
                                            if (!row.getIsSelected()) {
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).style.backgroundColor = 'var(--app-fg-subtle)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!row.getIsSelected()) {
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).style.backgroundColor = '';
                                            }
                                        }}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell
                                                key={cell.id}
                                                className="overflow-hidden"
                                                style={{ color: 'var(--app-fg)' }}
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
                                        className="h-24 text-center"
                                        style={{ color: 'var(--app-fg-muted)' }}
                                    >
                                        No repositories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex-none flex items-center justify-between py-3">
                <span className="text-sm" style={{ color: 'var(--app-fg-muted)' }}>
                    Page {currentPage + 1} of {totalPages || 1}
                </span>
                <span className="text-sm" style={{ color: 'var(--app-fg-muted)' }}>
                    Built by{' '}
                    <a
                        href="https://visalan.me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-colors"
                        style={{ color: 'var(--app-fg)' }}
                    >
                        Visalan H
                    </a>
                    ,{' '}
                    <a
                        href="https://roopak.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-colors"
                        style={{ color: 'var(--app-fg)' }}
                    >
                        Roopak CS
                    </a>
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="border text-[var(--app-fg)] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: 'var(--app-border)',
                        }}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="border text-[var(--app-fg)] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: 'var(--app-border)',
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
