import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import { Button } from '@/components/ui/button';

const YearSelector = () => {
  const { selectedYears, toggleYearSelection } = useSalePerformanceStore();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) =>
    (2020 + i).toString()
  );

  return (
    <div className='flex flex-1 flex-col'>
      <h2>Select Year</h2>
      <div className='grid grid-cols-3 gap-2 py-2'>
        {years.map((year) => (
          <Button
            key={year}
            variant={selectedYears.includes(year) ? 'default' : 'secondary'}
            onClick={() => toggleYearSelection(year)}
            className='w-[145px]'
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
