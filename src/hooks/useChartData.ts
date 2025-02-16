import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChartService, ChartDataItem } from '@/services/ChartDataService';

export function useChartData(
  from?: Date,
  to?: Date,
  filters?: { mainChannel?: string; subChannel?: string; salePerson?: string }
) {
  const queryClient = useQueryClient();
  const [localChartData, setLocalChartData] = useState<ChartDataItem[] | null>(
    null
  );

  // ✅ ใช้ `useEffect()` โหลดค่าจาก `localStorage` หลังจากที่ DOM พร้อม
  useEffect(() => {
    if (typeof window !== 'undefined' && document.readyState === 'complete') {
      try {
        const storedData = localStorage.getItem('chartData');
        if (storedData) {
          const { data, timestamp } = JSON.parse(storedData);
          if (Date.now() - timestamp <= 60 * 60 * 1000) {
            setLocalChartData(data ?? []);
          }
        }
      } catch (error) {
        console.error('❌ Error accessing localStorage:', error);
      }
    }
  }, []);

  const { data, isLoading, error } = useQuery<ChartDataItem[], Error>({
    queryKey: [
      'chartData',
      from && from instanceof Date ? from.toISOString() : '',
      to && to instanceof Date ? to.toISOString() : '',
      JSON.stringify(filters)
    ],
    queryFn: async () => {
      return await ChartService.fetchChartData(from, to, filters);
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // ✅ บันทึกข้อมูล API ลง `localStorage` เมื่อดึงข้อมูลสำเร็จ
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      document.readyState === 'complete' &&
      data
    ) {
      try {
        localStorage.setItem(
          'chartData',
          JSON.stringify({ data, timestamp: Date.now() })
        );
        setLocalChartData(data);
        queryClient.setQueryData(['chartData'], data);
      } catch (error) {
        console.error('❌ Error setting localStorage:', error);
      }
    }
  }, [data, queryClient]);

  return { chartData: localChartData ?? data ?? [], isLoading, error };
}
