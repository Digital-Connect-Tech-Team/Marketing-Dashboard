'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  totalPages: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  totalPages
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  const store = useSalePerformanceStore();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    } else {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div>
      <div>
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
          <TableBody className='max-h-[500px] w-full overflow-y-auto'>
            {showLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Loading....
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length &&
              store.selectedBarCategory ? (
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
      {store.selectedBarCategory && (
        <div className='my-3 flex items-center space-x-6 justify-self-center lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => store.setCurrentPage(1)}
              disabled={store.currentPage === 1}
            >
              <ChevronsLeft />
            </Button>

            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => store.setCurrentPage(store.currentPage - 1)}
              disabled={store.currentPage === 1}
            >
              <ChevronLeft />
            </Button>

            {Array.from({ length: 5 }, (_, i) => {
              const startPage = Math.max(
                1,
                Math.min(totalPages - 4, store.currentPage - 2)
              );
              const pageNum = startPage + i;
              return pageNum <= totalPages ? (
                <Button
                  key={pageNum}
                  variant={
                    pageNum === store.currentPage ? 'default' : 'outline'
                  }
                  className='h-8 w-8 rounded-full p-0'
                  onClick={() => store.setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ) : null;
            })}

            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => store.setCurrentPage(store.currentPage + 1)}
              disabled={store.currentPage >= totalPages}
            >
              <ChevronRight />
            </Button>

            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => store.setCurrentPage(totalPages)}
              disabled={store.currentPage >= totalPages}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
