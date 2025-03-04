'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ChannelSelectProps {
  type: 'main' | 'sub' | 'sale';
}

export default function ChannelSelect({ type }: ChannelSelectProps) {
  const { data: session } = useSession();
  const store = useSalePerformanceStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | false>(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const isFetchingSales = useRef(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const channelMappings = {
    main: {
      available: store.availableMainChannels,
      selected: store.selectedMainChannel,
      setSelected: store.setSelectedMainChannel
    },
    sub: {
      available: store.availableSubChannels,
      selected: store.selectedSubChannel,
      setSelected: store.setSelectedSubChannel
    },
    sale: {
      available: store.availableSales,
      selected: store.selectedSaleChannel,
      setSelected: store.setSelectedSaleChannel
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await store.fetchChannels();
        if (type === 'sale' && !isFetchingSales.current) {
          isFetchingSales.current = true;
          await store.fetchSales();
          isFetchingSales.current = false;
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (type === 'main') {
      setSelectedValues(store.selectedMainChannel);
    } else if (type === 'sub') {
      setSelectedValues(store.selectedSubChannel);
    } else if (type === 'sale') {
      setSelectedValues(store.selectedSaleChannel);
    } else {
      setSelectedValues([
        ...store.selectedMainChannel,
        ...store.selectedSubChannel,
        ...store.selectedSaleChannel
      ]);
    }
  }, [
    store.selectedMainChannel,
    store.selectedSubChannel,
    store.selectedSaleChannel,
    type
  ]);

  const handleSelect = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleConfirm = async () => {
    channelMappings[type].setSelected(selectedValues);

    setIsOpen(false);
    const filters = {
      type: store.selectedType,
      from: store.dateRange?.from,
      to: store.dateRange?.to,
      year: store.selectedMonthYear.year ?? store.selectedQuarterYear.year,
      months: store.selectedMonthYear.months,
      quarters: store.selectedQuarterYear.quarters,
      years: store.selectedYears,
      mainChannels:
        type === 'main' ? selectedValues : store.selectedMainChannel,
      subChannels: type === 'sub' ? selectedValues : store.selectedSubChannel,
      sales: type === 'sale' ? selectedValues : store.selectedSaleChannel
    };

    if (type === 'main') {
      store.setSelectedSubChannel([]);
      store.setSelectedSaleChannel([]);
    } else if (type === 'sub') {
      store.setSelectedSaleChannel([]);
    }

    try {
      store.refreshChartData();
    } catch (error) {
      console.error('❌ Error sending data to API:', error);
    }
  };

  return (
    <div className='w-full' ref={selectRef}>
      <Select
        open={isOpen}
        disabled={type === 'main' && session?.user.role.name !== 'Master'}
      >
        <SelectTrigger className='w-full' onClick={() => setIsOpen(true)}>
          <SelectValue
            placeholder={
              channelMappings[type].selected.length === 0
                ? type === 'main'
                  ? session?.user.role.name !== 'Master'
                    ? session?.user.domain.main_channel
                    : 'Channel'
                  : type === 'sub'
                    ? 'Sub Channel'
                    : 'Sale'
                : channelMappings[type].selected.length === 1
                  ? channelMappings[type].selected[0]
                  : `${channelMappings[type].selected.length} items selected`
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
                channelMappings[type].available.map((item, i) => (
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
                OK
              </Button>
            </div>
          </SelectContent>
        )}
      </Select>
    </div>
  );
}
