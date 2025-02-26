'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import { Checkbox } from '@/components/ui/checkbox'; // ✅ ใช้ Checkbox จำลอง Multiple Select
import { Button } from '@/components/ui/button';
import { FilterDate } from '@/interfaces/global';

interface ChannelSelectProps {
  type: 'main' | 'sub' | 'sale';
}

export default function ChannelSelect({ type }: ChannelSelectProps) {
  const { data: session } = useSession();
  const {
    dateRange,
    chartData,
    selectedType,
    selectedMonthYear,
    selectedQuarterYear,
    selectedYears,
    setChartData,
    fetchChannels,
    availableMainChannels,
    availableSubChannels,
    selectedMainChannel,
    selectedSubChannel,
    selectedSaleChannel,
    setSelectedMainChannel,
    setSelectedSubChannel,
    setSelectedSaleChannel,
    fetchSales,
    availableSales
  } = useSalePerformanceStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | false>(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const isFetchingSales = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchChannels();
        if (type === 'sale' && !isFetchingSales.current) {
          isFetchingSales.current = true;
          await fetchSales();
          isFetchingSales.current = false;
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [selectedSubChannel]);

  function handleSelect(value: string) {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleConfirm() {
    if (type === 'main') setSelectedMainChannel(selectedValues);
    if (type === 'sub') setSelectedSubChannel(selectedValues);
    if (type === 'sale') setSelectedSaleChannel(selectedValues);

    setIsOpen(false);
    const filters = {
      type: selectedType,
      from: dateRange?.from,
      to: dateRange?.to,
      year: selectedMonthYear.year ?? selectedQuarterYear.year,
      months: selectedMonthYear.months,
      quarters: selectedQuarterYear.quarters,
      years: selectedYears,
      mainChannels: type === 'main' ? selectedValues : selectedMainChannel,
      subChannels: type === 'sub' ? selectedValues : selectedSubChannel,
      sales: type === 'sale' ? selectedValues : selectedSaleChannel
    };
    try {
      const response = await fetch('/api/lead/count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filters })
      });
      if (!response.ok) {
        throw new Error('Failed to send data');
      }

      const filteredData = await response.json();

      setChartData(filteredData);
    } catch (error) {
      console.error('❌ Error sending data to API:', error);
    }
  }

  return (
    <div className='w-full' ref={selectRef}>
      <Select
        open={isOpen}
        disabled={
          type === 'main' && session?.user.role.name !== 'Master' ? true : false
        }
      >
        <SelectTrigger className='w-full' onClick={() => setIsOpen(true)}>
          <SelectValue
            placeholder={
              selectedValues.length === 0
                ? type === 'main'
                  ? session?.user.role.name !== 'Master'
                    ? session?.user.domain.main_channel
                    : 'Channel'
                  : type === 'sub'
                    ? 'Sub Channel'
                    : 'Sale'
                : selectedValues.length === 1
                  ? selectedValues[0]
                  : `${selectedValues.length} items selected`
            }
          />
        </SelectTrigger>
        {isOpen && (
          <SelectContent onClick={(e) => e.stopPropagation()}>
            <div className='max-h-[340px] overflow-auto p-2'>
              {loading ? (
                <SelectItem disabled value='loading'>
                  Loading...
                </SelectItem>
              ) : error ? (
                <SelectItem disabled value='error'>
                  {error}
                </SelectItem>
              ) : (
                (type === 'main'
                  ? availableMainChannels
                  : type === 'sub'
                    ? availableSubChannels
                    : availableSales
                ).map((item, i) => (
                  <div
                    key={i}
                    className='flex cursor-pointer items-center p-2 hover:bg-gray-100'
                    onClick={() => handleSelect(item)}
                  >
                    <Checkbox
                      checked={selectedValues.includes(item)}
                      className='mr-2'
                    />
                    {item}
                  </div>
                ))
              )}
            </div>
            <div className='flex justify-between border-t p-2'>
              <Button
                onClick={() => setIsOpen(false)}
                className='mt-2'
                variant='danger'
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm} className='mt-2'>
                ok
              </Button>
            </div>
          </SelectContent>
        )}
      </Select>
    </div>
  );
}
