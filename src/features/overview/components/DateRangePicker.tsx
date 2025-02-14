import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
}

export default function DateRangePicker({
  dateRange,
  onDateChange
}: DateRangePickerProps) {
  // ✅ ตรวจสอบค่า dateRange และใช้ default หากเป็น undefined
  const safeDateRange: DateRange | undefined = dateRange.from
    ? { from: dateRange.from, to: dateRange.to ?? dateRange.from }
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-full'>
          {safeDateRange?.from && safeDateRange?.to
            ? `${format(safeDateRange.from, 'dd/MM/yyyy')} - ${format(safeDateRange.to, 'dd/MM/yyyy')}`
            : 'Select Date Range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto rounded-lg bg-background p-0 shadow-md'>
        <Calendar
          mode='range'
          selected={safeDateRange} // ✅ แปลงให้เป็น `DateRange | undefined`
          onSelect={(range) => {
            if (range?.from) {
              onDateChange({ from: range.from, to: range.to ?? range.from });
            }
          }}
          numberOfMonths={2}
          className={cn(
            'rounded-md border bg-white dark:border-gray-700 dark:bg-neutral-900 dark:text-white',
            'p-4 shadow-lg'
          )}
          classNames={{
            day_selected: 'bg-blue-500 text-white rounded-md',
            day_today: 'border border-blue-500',
            day_outside: 'text-gray-500 dark:text-gray-400',
            day_disabled: 'text-gray-300 dark:text-gray-600',
            day_range_middle: 'bg-blue-300 dark:bg-blue-600 text-white'
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
