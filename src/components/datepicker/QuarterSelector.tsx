'use client';
import { useDatePicker } from '@/app/contexts/DatePickerContext';

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function QuarterSelector() {
  const { selected, setSelected } = useDatePicker();

  return (
    <div className='grid grid-cols-2 gap-2'>
      {quarters.map((quarter) => (
        <button
          key={quarter}
          onClick={() => setSelected(quarter)}
          className={`rounded-md px-6 py-2 ${
            selected === quarter ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
        >
          {quarter}
        </button>
      ))}
    </div>
  );
}
