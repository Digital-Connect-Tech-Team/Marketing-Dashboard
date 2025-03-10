'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Icons } from '@/components/icons';
const titles = [
  {
    name: 'Total Lead Sale',
    description: 'จำนวนลูกค้าที่ชำระค่าบริการสำรวจพื้นที่'
  },
  {
    name: 'Total Survey',
    description: 'จำนวนลูกค้าที่ผ่านการสำรวจพื้นที่แล้ว'
  },
  {
    name: 'Total Quotation',
    description: 'จำนวนลูกค้าทั้งหมดที่ได้รับใบเสนอราคา'
  },
  {
    name: 'Total Nurturing',
    description: 'จำนวนลูกค้าที่ชำระมัดจำ 30%'
  },
  {
    name: 'Total Win',
    description: 'จำนวนลูกค้าที่อยู่ระหว่างการพิจารณาใบเสนอราคา'
  }
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
          <CardHeader className='grid justify-between pb-2'>
            <CardTitle className='flex items-center text-sm font-bold'>
              {title.name}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='ms-1'>
                      {' '}
                      <Icons.help className='h-[15px] w-[15px]' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p> {title.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
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
