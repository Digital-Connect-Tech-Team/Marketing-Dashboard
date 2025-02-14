'use client';

import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export type Payment = {
  rd: string;
  name: string;
  main: string;
  sub: string;
  total: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'rd',
    // header: "RD",
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
  //   {
  //     accessorKey: "rd",
  //     header: () => <div className="text-right">RD</div>,
  //     cell: ({ row }) => {
  //       const amount = parseFloat(row.getValue("rd"))
  //       const formatted = new Intl.NumberFormat("en-US", {
  //         style: "currency",
  //         currency: "USD",
  //       }).format(amount)

  //       return <div className="text-right font-medium">{formatted}</div>
  //     },
  //   },
  {
    accessorKey: 'name',
    header: 'Name'
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
    accessorKey: 'total',
    header: 'Total (VAT)'
  }
];
