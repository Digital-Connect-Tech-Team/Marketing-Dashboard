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

const MonthSelector = () => {
  const { selectedMonthYear, setSelectedMonthYear, toggleMonthSelection } =
    useSalePerformanceStore();

  const monthsList = [
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) =>
    (2020 + i).toString()
  );

  return (
    <div className='flex flex-1 flex-col'>
      <h2>Select Year</h2>
      <div className='grid grid-cols-6 gap-2 py-2'>
        <Select
          value={selectedMonthYear.year}
          onValueChange={(value) =>
            setSelectedMonthYear({ ...selectedMonthYear, year: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedMonthYear.year} />
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

      <h2>Select Month</h2>
      <div className='grid grid-cols-6 gap-2 py-2'>
        {monthsList.map((month) => (
          <Button
            key={month}
            variant={
              selectedMonthYear.months.includes(month) ? 'default' : 'secondary'
            }
            onClick={() => toggleMonthSelection(month)}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MonthSelector;
