'use client';

import { useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Rectangle
} from 'recharts';

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

type ChartDataItem = {
  title: string;
  success: number;
  await: number;
};

function CustomBarShape(props: any) {
  const { fill, x, y, width, height, payload } = props;

  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      radius={payload.await === 0 ? 9 : [9, 0, 0, 9]}
    />
  );
}

const chartConfig = {
  success: {
    label: 'success',
    color: 'hsl(var(--chart-1))'
  },
  await: {
    label: 'await',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันโหลดข้อมูลจาก localStorage
  const loadChartData = () => {
    const storedData = localStorage.getItem('chartData');
    if (storedData) {
      setChartData(JSON.parse(storedData).data);
      setLoading(false);
    }
  };

  // โหลดข้อมูลตอน Component mount
  useEffect(() => {
    loadChartData();
  }, []);

  // ตรวจสอบการเปลี่ยนแปลงของ localStorage ทุก 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      const storedData = localStorage.getItem('chartData');
      if (storedData) {
        const parsedData = JSON.parse(storedData).data;
        if (JSON.stringify(parsedData) !== JSON.stringify(chartData)) {
          setChartData(parsedData);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [chartData]);

  if (loading) return <div>Loading chart...</div>;

  function handleBarClick(data: any, index: number, type: 'success' | 'await') {
    const updatedData = chartData.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [type]: item[type] + 10
        };
      }
      return item;
    });

    setChartData(updatedData);
    localStorage.setItem('chartData', JSON.stringify({ data: updatedData }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horizontal Stacked Bar Chart - Legend</CardTitle>
        <CardDescription>Period : January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            layout='vertical'
            data={chartData}
            width={600}
            height={400}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type='number' axisLine={false} tickLine={false} />
            <YAxis
              type='category'
              dataKey='title'
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey='success'
              stackId='a'
              fill='var(--color-success)'
              shape={<CustomBarShape />}
              onClick={(data, index) => handleBarClick(data, index, 'success')}
            />
            <Bar
              dataKey='await'
              stackId='a'
              fill='var(--color-await)'
              radius={[0, 9, 9, 0]}
              onClick={(data, index) => handleBarClick(data, index, 'await')}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        <div className='leading-none text-muted-foreground'>
          Latest updated: {new Date().toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}
