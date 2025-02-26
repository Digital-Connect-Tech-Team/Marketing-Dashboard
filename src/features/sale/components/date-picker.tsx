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
  const {
    dateRange,
    setDateRange,
    selectedMonthYear,
    selectedQuarterYear,
    selectedYears,
    selectedType,
    setSelectedType,
    resetDateFilters,
    refreshChartData,
    resetChannel,
    setChartData
  } = useSalePerformanceStore();

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
      setChartData(initialData);
    }
  }, [initialData, setChartData]);

  const formattedDate = useMemo(() => {
    if (selectedType === 'date' && dateRange?.from) {
      return dateRange.to
        ? `${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`
        : format(dateRange.from, 'MMM d, yyyy');
    }
    if (selectedType === 'month' && selectedMonthYear.months.length > 0) {
      return `${selectedMonthYear.months.join(', ')}, ${selectedMonthYear.year}`;
    }
    if (selectedType === 'quarter' && selectedQuarterYear.quarters.length > 0) {
      return `${selectedQuarterYear.quarters.join(', ')}, ${selectedQuarterYear.year}`;
    }
    if (selectedType === 'year' && selectedYears.length > 0) {
      return selectedYears.join(', ');
    }
    return 'Period Range';
  }, [
    selectedType,
    dateRange,
    selectedMonthYear,
    selectedQuarterYear,
    selectedYears
  ]);

  const setFilters = async () => {
    let filterParams: any = {
      type: selectedType,
      from: dateRange?.from
        ? new Date(dateRange.from.setHours(0, 0, 0, 0)).toISOString() // Convert to UTC
        : null,
      to: dateRange?.to
        ? new Date(dateRange.to.setHours(23, 59, 59, 999)).toISOString() // Convert to UTC end of day
        : null,
      months:
        selectedMonthYear.months.length > 0 ? selectedMonthYear.months : null,
      year: selectedMonthYear.year || null,
      quarters:
        selectedQuarterYear.quarters.length > 0
          ? selectedQuarterYear.quarters
          : null,
      years: selectedYears.length > 0 ? selectedYears : null
    };

    try {
      if (session?.user.role.name === 'Master') {
        resetChannel('all');
      } else {
        resetChannel(['sub', 'sale']);
      }
      refreshChartData();
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
                variant={selectedType === type ? 'default' : 'secondary'}
                onClick={() => {
                  setSelectedType(type);
                  resetDateFilters();
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          <div className='rounded-md border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-neutral-900 dark:text-white'>
            {selectedType === 'date' && (
              <Calendar
                mode='range'
                selected={dateRange}
                defaultMonth={dateRange?.from}
                onSelect={setDateRange}
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
            {selectedType === 'month' && <MonthSelector />}
            {selectedType === 'quarter' && <QuarterSelector />}
            {selectedType === 'year' && <YearSelector />}
          </div>
        </div>
        <div className='items-right gap gap-col-3 flex justify-end gap-4 px-4 pb-4'>
          <Button
            variant='secondary'
            className='w-[140px]'
            onClick={() => {
              resetDateFilters();
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
