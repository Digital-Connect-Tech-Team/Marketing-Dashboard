'use client';
import { useDatePicker } from '@/app/contexts/DatePickerContext';
import { useRouter } from 'next/navigation';

export default function DateModeSelector() {
  const { mode, setMode } = useDatePicker();
  const router = useRouter();

  function changeMode(newMode: 'date' | 'month' | 'quarter' | 'year') {
    setMode(newMode);
    router.push(`/dashboard/${newMode}`);
  }

  return (
    <div className='flex gap-2'>
      {['date', 'month', 'quarter', 'year'].map((m) => (
        <button
          key={m}
          onClick={() => changeMode(m as any)}
          className={`rounded-md px-4 py-2 ${
            mode === m ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}
