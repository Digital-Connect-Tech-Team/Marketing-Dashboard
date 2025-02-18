'use client';
import PageContainer from '@/components/layout/page-container';
import React, { useState, useCallback, useEffect } from 'react';
import DashboardCards from '@/features/overview/components/DashboardCards';
import DateRangePicker from '@/features/overview/components/DateRangePicker';
import ChannelSelect from '@/features/overview/components/ChannelSelect';
import UserSelect from '@/features/overview/components/UserSelect';
import { useChartData } from '@/hooks/useChartData';
import { useFetchUsers } from '@/hooks/useFetchUsers';
import { useFetchChannels } from '@/hooks/useFetchChannels';
import { useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import ChartService from '@/server/ChartDataService';

export default function OverViewLayout({
  bar_stats,
  table_stats
}: {
  bar_stats: React.ReactNode;
  table_stats: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const {
    mainChannel,
    subChannel,
    loading: channelsLoading,
    fetchError: channelsError
  } = useFetchChannels();
  const {
    users,
    loading: usersLoading,
    fetchError: usersError
  } = useFetchUsers();

  // ✅ โหลดค่าจาก `localStorage` เมื่อ Component Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFilters = localStorage.getItem('selectedFilters');
        const storedDateRange = localStorage.getItem('dateRange');

        if (storedFilters) {
          setSelectedFilters(JSON.parse(storedFilters));
        }

        if (storedDateRange) {
          setDateRange(JSON.parse(storedDateRange));
        }
      } catch (error) {
        console.error('❌ Error loading filters from localStorage:', error);
      }
    }
  }, []);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });

  const [selectedFilters, setSelectedFilters] = useState({
    mainChannel: '',
    subChannel: '',
    salePerson: ''
  });

  const { chartData, isLoading } = useChartData(
    dateRange.from,
    dateRange.to,
    selectedFilters
  );

  // ✅ ฟังก์ชันอัปเดตข้อมูล
  const updateChartData = useCallback(
    async (filters: typeof selectedFilters, range: DateRange) => {
      try {
        console.log('⏳ Fetching new data:', { filters, range });
        const newData = await ChartService.fetchChartData(
          range.from,
          range.to,
          filters
        );

        localStorage.setItem(
          'chartData',
          JSON.stringify({ data: newData, timestamp: Date.now() })
        );
        console.log('✅ Data updated in localStorage:', newData);

        queryClient.invalidateQueries({ queryKey: ['chartData'] });
      } catch (error) {
        console.error('❌ Error updating chart data:', error);
      }
    },
    [queryClient]
  );

  // ✅ ฟังก์ชันเปลี่ยนค่าของฟิลเตอร์ (Main Channel, Sub Channel, Sale Person)
  const handleFilterChange = useCallback(
    async (key: keyof typeof selectedFilters, value: string) => {
      setSelectedFilters((prev) => {
        const newFilters = { ...prev, [key]: value };

        if (key === 'mainChannel') {
          newFilters.subChannel = '';
          newFilters.salePerson = '';
        }
        if (key === 'subChannel') {
          newFilters.salePerson = '';
        }

        localStorage.setItem('selectedFilters', JSON.stringify(newFilters)); // ✅ อัปเดต `localStorage`

        updateChartData(newFilters, dateRange);
        return newFilters;
      });
    },
    [dateRange, updateChartData]
  );

  // ✅ ฟังก์ชันเปลี่ยนค่าของวันที่
  const handleDateChange = useCallback(
    (range: DateRange) => {
      if (!range.from) return;

      const newRange = { from: range.from, to: range.to ?? range.from };

      setDateRange(newRange);
      setSelectedFilters({ mainChannel: '', subChannel: '', salePerson: '' });

      localStorage.setItem('dateRange', JSON.stringify(newRange)); // ✅ อัปเดต `localStorage`
      localStorage.setItem(
        'selectedFilters',
        JSON.stringify({ mainChannel: '', subChannel: '', salePerson: '' })
      );

      updateChartData(
        { mainChannel: '', subChannel: '', salePerson: '' },
        newRange
      );
    },
    [updateChartData]
  );

  // ✅ รีเซ็ตค่าทั้งหมด
  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedFilters({ mainChannel: '', subChannel: '', salePerson: '' });

    localStorage.removeItem('selectedFilters');
    localStorage.removeItem('dateRange');

    console.log('🔄 Reset all filters');
    queryClient.invalidateQueries({ queryKey: ['chartData'] });
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Sale Performance Dashboard
        </h2>
        <h2 className='text-1xl font-bold tracking-tight'>
          Products: SCG Solar Roof Solution (OB)
        </h2>

        <DashboardCards data={chartData ?? []} isLoading={isLoading} />

        <div className='flex flex-row gap-4 py-2'>
          <DateRangePicker
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
          <ChannelSelect
            type='main'
            channels={mainChannel}
            loading={channelsLoading}
            error={channelsError}
            selected={selectedFilters.mainChannel}
            onChange={(value) => handleFilterChange('mainChannel', value)}
          />
          <ChannelSelect
            type='sub'
            channels={subChannel}
            loading={channelsLoading}
            error={channelsError}
            selected={selectedFilters.subChannel}
            onChange={(value) => handleFilterChange('subChannel', value)}
          />
          <UserSelect
            users={users}
            loading={usersLoading}
            error={usersError}
            selected={selectedFilters.salePerson}
            onChange={(value) => handleFilterChange('salePerson', value)}
          />
          <button
            className='rounded bg-red-500 px-4 py-2 text-white'
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4'>{table_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
