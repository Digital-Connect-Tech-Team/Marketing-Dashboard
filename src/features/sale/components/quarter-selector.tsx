import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const QuarterSelector = () => {
  const {
    selectedQuarterYear,
    setSelectedQuarterYear,
    toggleQuarterSelection
  } = useSalePerformanceStore();

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) =>
    (2020 + i).toString()
  );

  return (
    <div className='flex flex-1 flex-col'>
      <h2>Select Year</h2>
      <div className='grid grid-cols-6 gap-2 py-2'>
        <Select
          value={selectedQuarterYear.year}
          onValueChange={(value) =>
            setSelectedQuarterYear({ ...selectedQuarterYear, year: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedQuarterYear.year} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <h2>Select Quarter</h2>
      <div className='grid grid-cols-6 gap-2 py-2'>
        {quarters.map((quarter) => (
          <Button
            key={quarter}
            variant={
              selectedQuarterYear.quarters.includes(quarter)
                ? 'default'
                : 'secondary'
            }
            onClick={() => toggleQuarterSelection(quarter)}
          >
            {quarter}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuarterSelector;
