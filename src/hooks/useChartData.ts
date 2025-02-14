import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChartService, ChartDataItem } from '@/services/ChartDataService';
import { useEffect } from 'react';

export function useChartData(
  from?: Date,
  to?: Date,
  filters?: { mainChannel?: string; subChannel?: string; salePerson?: string }
) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ChartDataItem[], Error>({
    queryKey: [
      'chartData',
      from?.toISOString() ?? '',
      to?.toISOString() ?? '',
      JSON.stringify(filters)
    ],
    queryFn: async () => {
      return await ChartService.fetchChartData(from, to, filters);
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    initialData: () => {
      // ✅ โหลดแคชจาก localStorage ถ้ามี
      const storedData = localStorage.getItem('chartData');
      if (storedData) {
        const { data, timestamp } = JSON.parse(storedData);
        if (Date.now() - timestamp <= 60 * 60 * 1000) {
          return data ?? [];
        }
      }
      return undefined;
    }
  });

  useEffect(() => {
    if (data) {
      localStorage.setItem(
        'chartData',
        JSON.stringify({ data, timestamp: Date.now() })
      );
      queryClient.setQueryData(['chartData'], data);
    }
  }, [data, queryClient]);

  return { chartData: data ?? [], isLoading, error };
}
