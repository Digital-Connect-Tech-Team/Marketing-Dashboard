'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import MonthSelector from './month-selector';
import YearSelector from './year-selector';
import QuarterSelector from './quarter-selector';
import { useSession } from 'next-auth/react';

export default function DateRangePicker({ initialData }: { initialData: any }) {
  const { data: session } = useSession();
  const store = useSalePerformanceStore();

  const [open, setOpen] = useState(false);

  const monthOrder = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  useEffect(() => {
    if (initialData) {
      store.setChartData(initialData);
    }
  }, [initialData, store.setChartData]);

  useEffect(() => {
    store.setSelectedBarBadge('');
    store.setSelectedBarCategory('');
  }, [store.chartData]);

  const formattedDate = useMemo(() => {
    if (store.selectedType === 'date' && store.dateRange?.from) {
      return store.dateRange.to
        ? `${format(store.dateRange.from, 'MMM d, yyyy')} to ${format(store.dateRange.to, 'MMM d, yyyy')}`
        : format(store.dateRange.from, 'MMM d, yyyy');
    }
    if (
      store.selectedType === 'month' &&
      store.selectedMonthYear.months.length > 0
    ) {
      return `${store.selectedMonthYear.months.join(', ')}, ${store.selectedMonthYear.year}`;
    }
    if (
      store.selectedType === 'quarter' &&
      store.selectedQuarterYear.quarters.length > 0
    ) {
      return `${store.selectedQuarterYear.quarters.join(', ')}, ${store.selectedQuarterYear.year}`;
    }
    if (store.selectedType === 'year' && store.selectedYears.length > 0) {
      return store.selectedYears.join(', ');
    }
    return 'Period Range';
  }, [
    store.selectedType,
    store.dateRange,
    store.selectedMonthYear,
    store.selectedQuarterYear,
    store.selectedYears
  ]);

  const setFilters = async () => {
    let filterParams: any = {
      type: store.selectedType,
      from: store.dateRange?.from
        ? new Date(store.dateRange.from.setHours(0, 0, 0, 0)).toISOString() // Convert to UTC
        : null,
      to: store.dateRange?.to
        ? new Date(store.dateRange.to.setHours(23, 59, 59, 999)).toISOString() // Convert to UTC end of day
        : null,
      months:
        store.selectedMonthYear.months.length > 0
          ? store.selectedMonthYear.months
          : null,
      year: store.selectedMonthYear.year || null,
      quarters:
        store.selectedQuarterYear.quarters.length > 0
          ? store.selectedQuarterYear.quarters
          : null,
      years: store.selectedYears.length > 0 ? store.selectedYears : null
    };

    try {
      if (session?.user.role.name === 'Master') {
        store.resetChannel('all');
      } else {
        store.resetChannel(['sub', 'sale']);
      }
      store.refreshChartData();
    } catch (error) {
      console.error('❌ Error fetching filtered data:', error);
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-between text-left font-normal'
        >
          {formattedDate}
          <CalendarIcon className='ml-2 h-4 w-4 justify-items-end' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto rounded-lg bg-[#f3f3f3] p-0 shadow-md'
        align='start'
      >
        <div className='flex items-center justify-between gap-4 p-4'>
          <div className='mb-auto grid grid-cols-1 gap-2'>
            {['date', 'month', 'quarter', 'year'].map((type) => (
              <Button
                key={type}
                variant={store.selectedType === type ? 'default' : 'secondary'}
                onClick={() => {
                  store.setSelectedType(type);
                  store.resetDateFilters();
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          <div className='rounded-md border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-neutral-900 dark:text-white'>
            {store.selectedType === 'date' && (
              <Calendar
                mode='range'
                selected={store.dateRange}
                defaultMonth={store.dateRange?.from}
                onSelect={store.setDateRange}
                numberOfMonths={2}
                modifiers={{
                  sunday: (date) => date.getDay() === 0
                }}
                modifiersClassNames={{
                  sunday: 'text-[#214EA2] font-bold'
                }}
                classNames={{
                  head_cell:
                    '[&:first-child]:text-[#214EA2] rounded-md w-8 font-bold text-[0.8rem]',
                  head: 'border-b border-black',
                  day_today: 'border border-blue-500',
                  day_outside: 'text-gray-500 dark:text-gray-400',
                  day_disabled: 'text-gray-300 dark:text-gray-600',
                  day_range_middle:
                    'bg-blue-300 dark:bg-blue-600 !text-white rounded-none',
                  day_range_start: '!rounded-l-full !opacity-50',
                  day_range_end: '!rounded-r-full !opacity-50'
                }}
              />
            )}
            {store.selectedType === 'month' && <MonthSelector />}
            {store.selectedType === 'quarter' && <QuarterSelector />}
            {store.selectedType === 'year' && <YearSelector />}
          </div>
        </div>
        <div className='items-right gap gap-col-3 flex justify-end gap-4 px-4 pb-4'>
          <Button
            variant='secondary'
            className='w-[140px]'
            onClick={() => {
              store.resetDateFilters();
            }}
          >
            Clear Selection
          </Button>
          <Button
            variant='danger'
            className='w-[140px]'
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant='success'
            className='w-[140px]'
            onClick={() => {
              setFilters();
            }}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
