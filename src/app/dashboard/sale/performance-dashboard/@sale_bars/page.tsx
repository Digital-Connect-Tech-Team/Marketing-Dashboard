'use client';

import { useEffect, useState } from 'react';
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
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import { format } from 'date-fns';

type ChartDataItem = {
  title: string;
  success: number;
  pending: number;
  high: number;
  medium: number;
  low: number;
  win: number;
  loss: number;
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
      radius={payload.pending === 0 || payload.loss === 0 ? 9 : [9, 0, 0, 9]}
    />
  );
}

const chartConfig: ChartConfig = {
  success: { label: 'Success', color: 'hsl(var(--onnex-cobalt-blue))' },
  pending: { label: 'Pending', color: 'hsl(var(--onnex-gray))' },
  high: { label: 'High', color: 'hsl(var(--onnex-cobalt-blue))' },
  medium: { label: 'Medium', color: 'hsl(var(--onnex-green))' },
  low: { label: 'Low', color: 'hsl(var(--onnex-aqua-blue))' },
  win: { label: 'Win', color: 'hsl(var(--onnex-cobalt-blue))' },
  loss: { label: 'Loss', color: 'hsl(var(--onnex-red))' }
};

const monthOrder = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export default function SaleBarChart() {
  const {
    chartData,
    refreshChartData,
    dateRange,
    selectedMonthYear,
    selectedYears,
    setSelectedBarCategory,
    setSelectedBarBadge,
    selectedQuarterYear
  } = useSalePerformanceStore();
  const [clientTime, setClientTime] = useState('');
  const [period, setPeriod] = useState('All');

  useEffect(() => {
    setClientTime(new Date().toLocaleString());
  }, []);

  useEffect(() => {
    if (dateRange?.from || dateRange?.to) {
      if (!dateRange?.to) {
        setPeriod(`${format(dateRange.from ?? new Date(), 'MMM d, yyyy')}`);
      } else {
        setPeriod(
          `${format(dateRange.from ?? new Date(), 'MMM d, yyyy')} to ${format(dateRange?.to, 'MMM d, yyyy')}`
        );
      }
    } else if (selectedMonthYear.months.length > 0) {
      const sortedMonths = [...selectedMonthYear.months].sort(
        (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
      );
      setPeriod(`${sortedMonths.join(', ')}, ${selectedMonthYear.year}`);
    } else if (selectedQuarterYear.quarters.length > 0) {
      const sortedQuarters = [...selectedQuarterYear.quarters].sort();
      setPeriod(`${sortedQuarters.join(', ')}, ${selectedQuarterYear.year}`);
    } else if (selectedYears.length > 0) {
      const sortedYears = [...selectedYears].sort(
        (a, b) => parseInt(a) - parseInt(b)
      );
      setPeriod(sortedYears.join(', '));
    } else {
      setPeriod('All');
    }
  }, [dateRange, selectedMonthYear, selectedQuarterYear, selectedYears]);

  // รีเฟรชข้อมูลเมื่อ component mount
  useEffect(() => {
    refreshChartData();
  }, [refreshChartData]);

  function handleBarClick(
    data: ChartDataItem,
    type: 'success' | 'pending' | 'high' | 'medium' | 'low' | 'win' | 'loss'
  ) {
    if (data[type] === 0) return;
    setSelectedBarCategory(data.title);

    if (data.title !== 'Win/Loss') {
      setSelectedBarBadge('Total');
    } else {
      setSelectedBarBadge('Success');
    }
  }

  const transformedData = chartData?.map((item: any) => {
    if (item.title === 'Nurturing') {
      return {
        title: item.title,
        pending: item.pending || 0,
        high: item.high || 0,
        medium: item.medium || 0,
        low: item.low || 0
      };
    } else if (item.title === 'Win/Loss') {
      return {
        title: item.title,
        win: item.success || 0,
        loss: item.loss || 0
      };
    } else {
      return {
        title: item.title,
        success: item.success || 0,
        pending: item.pending || 0
      };
    }
  });

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            layout='vertical'
            data={transformedData}
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
            {/* <ChartLegend content={<ChartLegendContent />} /> */}

            <Bar
              dataKey='success'
              stackId='a'
              fill='var(--color-success)'
              shape={<CustomBarShape />}
              onClick={(_, index) =>
                handleBarClick(transformedData[index], 'success')
              }
            />

            {(
              ['high', 'medium', 'low', 'win', 'loss'] as Array<
                keyof Omit<ChartDataItem, 'title'>
              >
            ).map(
              (key) =>
                transformedData?.some((item: any) => item[key] > 0) && (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId='a'
                    fill={`var(--color-${key})`}
                    radius={key === 'high' || key === 'win' ? [9, 0, 0, 9] : 0}
                    onClick={(_, index) =>
                      handleBarClick(transformedData[index], key)
                    }
                  />
                )
            )}

            <Bar
              dataKey='pending'
              stackId='a'
              fill='var(--color-pending)'
              radius={[0, 9, 9, 0]}
              onClick={(_, index) =>
                handleBarClick(transformedData[index], 'pending')
              }
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        <h2 className='text-[14pt]'>Period : {period}</h2>
        <div className='leading-none text-muted-foreground'>
          Latest updated: {clientTime}
        </div>
      </CardFooter>
    </Card>
  );
}
