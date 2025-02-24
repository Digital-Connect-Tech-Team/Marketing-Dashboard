'use client';
import { useDatePicker } from '@/app/contexts/DatePickerContext';

const months = [
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

export default function MonthSelector() {
  const { selected, setSelected } = useDatePicker();

  return (
    <div className='grid grid-cols-4 gap-2'>
      {months.map((month) => (
        <button
          key={month}
          onClick={() => setSelected(month)}
          className={`rounded-md px-4 py-2 ${
            selected === month ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
        >
          {month}
        </button>
      ))}
    </div>
  );
}
