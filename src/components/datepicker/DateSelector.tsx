'use client';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useDatePicker } from '@/app/contexts/DatePickerContext';
import { Calendar } from '@/components/ui/calendar';

export default function DateSelector() {
  const { selected, setSelected } = useDatePicker();
  const [range, setRange] = useState<DateRange | undefined>(selected);

  return (
    <div>
      <Calendar
        mode='range'
        selected={range}
        onSelect={(value) => {
          setRange(value);
          setSelected(value);
        }}
        numberOfMonths={2}
      />
      <div className='mt-2 text-gray-600'>
        {range
          ? `${format(range.from!, 'PPP')} - ${format(range.to!, 'PPP')}`
          : 'Select a date range'}
      </div>
    </div>
  );
}
