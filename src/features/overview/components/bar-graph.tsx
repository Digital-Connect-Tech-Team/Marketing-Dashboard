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
  success: { label: 'success', color: 'hsl(var(--chart-1))' },
  await: { label: 'await', color: 'hsl(var(--chart-2))' }
} satisfies ChartConfig;

export function BarGraph() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string | null>(null);

  useEffect(() => {
    const loadChartData = () => {
      try {
        const storedData = localStorage.getItem('chartData');
        if (storedData) {
          setChartData(JSON.parse(storedData).data);
        }
      } catch (error) {
        console.error('❌ Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
    const interval = setInterval(loadChartData, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedDateRange = localStorage.getItem('dateRange');
    if (storedDateRange) {
      try {
        const parsedDateRange = JSON.parse(storedDateRange);
        const fromDate = new Date(parsedDateRange.from).toLocaleDateString(
          'en-GB'
        );
        const toDate = new Date(parsedDateRange.to).toLocaleDateString('en-GB');
        setDateRange(`${fromDate} - ${toDate}`);
      } catch (error) {
        console.error('❌ Error parsing dateRange:', error);
        setDateRange(null);
      }
    }
  }, []);
  function handleBarClick(data: ChartDataItem, type: 'success' | 'await') {
    if (data[type] === 0) return; // ถ้าค่าของ success หรือ await เป็น 0 ไม่ต้องส่ง
    localStorage.setItem(
      'selectedBar',
      JSON.stringify({ category: data.title, type })
    );
    window.dispatchEvent(new Event('storage')); // แจ้งเตือน TableStats ให้โหลดข้อมูลใหม่
  }
  if (loading) return <div>Loading chart...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Period : {dateRange ?? 'All'}</CardDescription>
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
              onClick={(_, index) =>
                handleBarClick(chartData[index], 'success')
              }
            />
            <Bar
              dataKey='await'
              stackId='a'
              fill='var(--color-await)'
              radius={[0, 9, 9, 0]}
              onClick={(_, index) => handleBarClick(chartData[index], 'await')}
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
