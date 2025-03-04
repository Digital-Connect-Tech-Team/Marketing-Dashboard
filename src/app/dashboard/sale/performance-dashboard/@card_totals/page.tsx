'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
const titles = [
  'Total Lead Sale',
  'Total Survey',
  'Total Quotation',
  'Total Nurturing',
  'Total Win'
];

export default function CardTotals() {
  const [isLoading, setIsLoading] = useState(true);
  const { chartData, refreshChartData, fetchTable } = useSalePerformanceStore();

  useEffect(() => {
    const loadData = async () => {
      await fetchTable();
      setIsLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('📊 Updated chartData');
  }, [chartData]);

  return (
    <div className='grid gap-4 md:grid-cols-5 lg:grid-cols-5'>
      {titles.map((title, index) => (
        <Card key={index}>
          <CardHeader className='flex justify-between pb-2'>
            <CardTitle className='text-sm font-bold'>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? 'Loading...' : (chartData?.[index]?.success ?? 0)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
