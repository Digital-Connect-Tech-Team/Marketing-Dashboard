'use client';
import { useDatePicker } from '@/app/contexts/DatePickerContext';

const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

export default function YearSelector() {
  const { selected, setSelected } = useDatePicker();

  return (
    <div className='grid grid-cols-3 gap-2'>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => setSelected(year)}
          className={`rounded-md px-6 py-2 ${
            selected === year ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
