'use client';

import { Button } from '@/components/ui/button';
import { SaleTable } from '@/interfaces/sale';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<SaleTable>[] = [
  {
    accessorKey: 'rd',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          RD
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    }
  },
  {
    accessorKey: 'name',
    header: 'ชื่อ นามสกุล'
  },
  {
    accessorKey: 'phone',
    header: 'หมายเลขโทรศัพท์'
  },
  {
    accessorKey: 'main',
    header: 'Main Channel'
  },
  {
    accessorKey: 'sub',
    header: 'Sub Channel'
  },
  {
    accessorKey: 'sale',
    header: 'Sale Person'
  },
  {
    accessorKey: 'total',
    header: 'มูลค่าเบื้องต้นรวม Vat'
  }
];
