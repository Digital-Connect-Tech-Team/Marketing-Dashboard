'use client';
import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  search: string;
  setSearch: (search: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  totalPages,
  setPage,
  setPageSize,
  search,
  setSearch
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      columnFilters,
      pagination: { pageIndex: page - 1, pageSize }
    }
  });

  return (
    <div>
      <div className='mb-4 flex items-center gap-4'>
        <Input
          placeholder='ค้นหาทุกคอลัมน์...'
          value={search}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('🔍 ค่าที่พิมพ์:', newValue); // ✅ Debugging
            setSearch(newValue);
            setPage(1); // ✅ รีเซ็ตไปหน้าแรกเมื่อค้นหาใหม่
          }}
        />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className='flex items-center justify-between px-2 py-4'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-6 lg:space-x-8'>
          <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
            Page {page} of {totalPages}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
