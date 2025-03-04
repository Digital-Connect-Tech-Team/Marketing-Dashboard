'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import { Badge } from '@/components/ui/badge';

const chartConfig = {
  totalloss: {
    label: 'Total Loss',
    color: ''
  },
  เลือกคู่แข่งเนื่องจากราคาถูกกว่า: {
    label: 'เลือกคู่แข่งเนื่องจากราคาถูกกว่า',
    color: '#A20303'
  },
  เลื่อนการตัดสินใจไม่มีกำหนด: {
    label: 'เลื่อนการตัดสินใจไม่มีกำหนด',
    color: '#AC6C13'
  },
  'ราคาสูง/คืนทุนช้า': {
    label: 'ราคาสูง/คืนทุนช้า',
    color: '#035FD7'
  },
  สอบถามข้อมูล: {
    label: 'สอบถามข้อมูล',
    color: '#036DD7'
  },
  พื้นที่หน้างานไม่เหมาะกับการติดตั้ง: {
    label: 'พื้นที่หน้างานไม่เหมาะกับการติดตั้ง',
    color: '#13AC86'
  },
  ใช้ไฟกลางวันน้อย: {
    label: 'ใช้ไฟกลางวันน้อย',
    color: '#D7BB03'
  },
  'เสนอราคาไปแล้ว 3 เดือนยังไม่ตัดสินใจ': {
    label: 'เสนอราคาไปแล้ว 3 เดือนยังไม่ตัดสินใจ',
    color: '#D77803'
  },
  ลูกค้านำงบประมาณไปใช้อย่างอื่นก่อน: {
    label: 'ลูกค้านำงบประมาณไปใช้อย่างอื่นก่อน',
    color: '#0354D7'
  },
  'ติดต่อไม่ได้เกิน 3 ครั้ง': {
    label: 'ติดต่อไม่ได้เกิน 3 ครั้ง',
    color: '#7AA203'
  },
  ไม่ระบุ: {
    label: 'ไม่ระบุ',
    color: '#e3e3e3'
  }
} satisfies Record<string, { label: string; color: string }>;

export function PieLoss() {
  interface ChartLossItem {
    name: string;
    count: number;
  }
  const store = useSalePerformanceStore();
  const categoryColors: Record<string, string> = {
    เลือกคู่แข่งเนื่องจากราคาถูกกว่า: '#A20303',
    เลื่อนการตัดสินใจไม่มีกำหนด: '#AC6C13',
    'ราคาสูง/คืนทุนช้า': '#035FD7',
    สอบถามข้อมูล: '#036DD7',
    พื้นที่หน้างานไม่เหมาะกับการติดตั้ง: '#13AC86',
    ใช้ไฟกลางวันน้อย: '#D7BB03',
    'เสนอราคาไปแล้ว 3 เดือนยังไม่ตัดสินใจ': '#D77803',
    ลูกค้านำงบประมาณไปใช้อย่างอื่นก่อน: '#0354D7',
    'ติดต่อไม่ได้เกิน 3 ครั้ง': '#7AA203',
    ไม่ระบุ: '#e3e3e3'
  };
  const chartData = (store.chartLoss ?? []).map((item: ChartLossItem) => ({
    category: item.name,
    visitors: item.count,
    fill: categoryColors[item.name] || 'hsl(var(--chart-default))'
  }));

  const totalVisitors = React.useMemo((): number => {
    return chartData.reduce(
      (acc: number, curr: { visitors: number }) => acc + curr.visitors,
      0
    );
  }, [chartData]);

  return (
    <div className='flex w-full items-start gap-8'>
      <div className='w-[200px]'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[200px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className='gap-2 whitespace-nowrap'
                />
              }
            />
            <Pie
              data={chartData}
              dataKey='visitors'
              nameKey='category'
              innerRadius={50}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 24}
                          className='mr-2 fill-muted-foreground'
                        >
                          Total Loss
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='mr-2 fill-muted-foreground'
                        >
                          Leads
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
        {Object.entries(categoryColors).map(([category, color]) => (
          <div
            key={category}
            className='flex items-center gap-2 whitespace-nowrap'
          >
            {/* ไอคอนสี */}
            <div
              className='h-4 w-4 rounded-md'
              style={{ backgroundColor: color }}
            ></div>
            {/* ข้อความ */}
            <span className='w-[150px] whitespace-pre-wrap text-sm text-gray-800'>
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
