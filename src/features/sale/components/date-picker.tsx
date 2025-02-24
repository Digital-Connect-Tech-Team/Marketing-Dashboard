'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import MonthSelector from './month-selector';
import YearSelector from './year-selector';
import QuarterSelector from './quarter-selector';
import ChartService from '@/server/ChartDataService';
import { useSaleChartData } from '@/hooks/use-sale-performance';

export default function DateRangePicker({ initialData }: { initialData: any }) {
  const {
    dateRange,
    setDateRange,
    selectedMonthYear,
    selectedQuarterYear,
    selectedYears,
    resetFilters,
    setChartData
  } = useSalePerformanceStore();

  const [selected, setSelected] = useState('date');
  const [open, setOpen] = useState(false);
  const [formattedDate, setFormattedDate] = useState('Period Range');

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

  const filterParams = {
    type: selected,
    from: dateRange?.from || null,
    to: dateRange?.to || null,
    months: selectedMonthYear?.months.length ? selectedMonthYear.months : null,
    year: selectedMonthYear?.year || selectedQuarterYear?.year || null,
    quarters: selectedQuarterYear?.quarters.length
      ? selectedQuarterYear.quarters
      : null,
    years: selectedYears.length ? selectedYears : null
  };

  // const { data, isLoading, isError } = useSaleChartData(filterParams);

  useEffect(() => {
    if (initialData) {
      setChartData(initialData);
    }
  }, [initialData, setChartData]);

  const setFilters = async () => {
    let filterParams: any = {
      type: selected,
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

    console.log('📡 Sending Filters to Backend:', filterParams); // Debugging

    if (selected === 'date' && dateRange?.from && !dateRange?.to) {
      setFormattedDate(`${format(dateRange.from, 'MMM d, yyyy')}`);
    } else if (selected === 'date' && dateRange?.from && dateRange?.to) {
      setFormattedDate(
        `${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`
      );
    } else if (selected === 'month' && selectedMonthYear.months.length > 0) {
      const sortedMonths = [...selectedMonthYear.months].sort(
        (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
      );
      setFormattedDate(`${sortedMonths.join(', ')}, ${selectedMonthYear.year}`);
    } else if (
      selected === 'quarter' &&
      selectedQuarterYear.quarters.length > 0
    ) {
      const sortedQuarters = [...selectedQuarterYear.quarters].sort();
      setFormattedDate(
        `${sortedQuarters.join(', ')}, ${selectedQuarterYear.year}`
      );
    } else if (selected === 'year' && selectedYears.length > 0) {
      const sortedYears = [...selectedYears].sort(
        (a, b) => parseInt(a) - parseInt(b)
      );
      setFormattedDate(sortedYears.join(', '));
    }

    try {
      const response = await fetch(`/api/lead/count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: filterParams })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error('Failed to fetch filtered data');
      }

      const filteredData = await response.json();
      console.log('✅ Fetched Filtered Data:', filteredData);

      setChartData(filteredData);
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
            <Button
              variant={selected === 'date' ? 'default' : 'secondary'}
              onClick={() => {
                setSelected('date');
                resetFilters();
              }}
            >
              Date
            </Button>
            <Button
              variant={selected === 'month' ? 'default' : 'secondary'}
              onClick={() => {
                setSelected('month');
                resetFilters();
              }}
            >
              Month
            </Button>
            <Button
              variant={selected === 'quarter' ? 'default' : 'secondary'}
              onClick={() => {
                setSelected('quarter');
                resetFilters();
              }}
            >
              Quarter
            </Button>
            <Button
              variant={selected === 'year' ? 'default' : 'secondary'}
              onClick={() => {
                setSelected('year');
                resetFilters();
              }}
            >
              Year
            </Button>
          </div>
          <div className='rounded-md border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-neutral-900 dark:text-white'>
            {selected === 'date' && (
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
            {selected === 'month' && <MonthSelector />}
            {selected === 'quarter' && <QuarterSelector />}
            {selected === 'year' && <YearSelector />}
          </div>
        </div>
        <div className='items-right gap gap-col-3 flex justify-end gap-4 px-4 pb-4'>
          <Button
            variant='secondary'
            className='w-[140px]'
            onClick={() => {
              resetFilters();
              setFormattedDate('Period Range');
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
