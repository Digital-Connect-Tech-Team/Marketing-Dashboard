'use client';

import { useEffect, useState } from 'react';
import { FetchTableResult, SaleTable } from '@/interfaces/sale';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import { PieLoss } from '@/features/sale/components/pie-loss';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SaleTableData() {
  const store = useSalePerformanceStore();
  const [data, setData] = useState<SaleTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  function setBadgeTable(badge: string) {
    setLoading(true);
    store.setSelectedBarBadge(badge);
    store.setCurrentPage(1);
    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await store.fetchTable();
        if (result && Array.isArray(result.data)) {
          setData(result.data);
          setTotalData(result.totalData);
          setCurrentPage(result.currentPage);
          setTotalPages(result.totalPages);
        } else {
          setData([]);
          setTotalData(0);
          setCurrentPage(1);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchLossData() {
      try {
        const result = await store.fetchChartLoss();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    if (store.selectedBarBadge === 'Loss') {
      fetchLossData();
    }
  }, [store.selectedBarBadge, store.currentPage, store.offset]);

  useEffect(() => {
    if (store.selectedBarCategory) {
      setLoading(true);
      store.setCurrentPage(1);
      store.fetchTable().then((result) => {
        if (result && Array.isArray(result.data)) {
          setData(result.data);
          setTotalData(result.totalData);
          setCurrentPage(result.currentPage);
          setTotalPages(result.totalPages);
        } else {
          setData([]);
          setTotalData(0);
          setCurrentPage(1);
          setTotalPages(1);
        }
        setLoading(false);
      });
    }
  }, [store.selectedBarCategory]);

  const statsMapping = {
    Survey: ['Total', 'Success', 'Pending'],
    Quotation: ['Total', 'Success', 'Pending'],
    Nurturing: ['Total', 'High', 'Medium', 'Low', 'Pending'],
    'Win/Loss': ['Success', 'Loss']
  } as const;

  const selectedCategory = store.selectedBarCategory || '';
  const chartData = store.chartData || [];
  const categoryData = chartData.find(
    (item: any) => item.title === selectedCategory
  );

  const selectedStats = statsMapping[
    selectedCategory as keyof typeof statsMapping
  ] || ['Total'];

  const totalValue = categoryData
    ? Object.keys(categoryData)
        .filter(
          (key) =>
            key !== 'title' &&
            !(selectedCategory === 'Nurturing' && key === 'success') &&
            !(selectedCategory === 'Win/Loss' && key === 'pending')
        )
        .reduce((sum, key) => sum + (categoryData[key] || 0), 0)
    : 0;

  const stats = selectedStats.map((title) => ({
    title,
    value:
      title === 'Total' ? totalValue : categoryData?.[title.toLowerCase()] || 0
  }));

  return (
    <div className='rounded-md border'>
      {store.selectedBarCategory && (
        <>
          <h2 className='px-4 py-2 text-[16pt]'>
            Total{' '}
            {selectedCategory === 'Win/Loss'
              ? store.selectedBarBadge === 'Loss'
                ? 'Loss'
                : 'Win'
              : store.selectedBarCategory}
          </h2>
          <div className='mx-4 mb-4 justify-self-center'>
            {selectedCategory && (
              <>
                {stats.map((stat, index) => (
                  <Button
                    variant={
                      store.selectedBarBadge === stat.title
                        ? 'default'
                        : 'secondary'
                    }
                    key={index}
                    className={`mx-2 mb-2 h-[30] w-[auto] cursor-pointer`}
                    onClick={() => setBadgeTable(stat.title)}
                  >
                    {' '}
                    {store.selectedBarCategory === 'Win/Loss' &&
                    stat.title === 'Success'
                      ? 'Win'
                      : stat.title}{' '}
                    ({stat.value})
                  </Button>
                ))}
              </>
            )}
          </div>
        </>
      )}
      {selectedCategory === 'Win/Loss' && store.selectedBarBadge === 'Loss' && (
        <div className='mx-4 mb-4'>
          <PieLoss />
        </div>
      )}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        totalPages={totalPages}
      />
    </div>
  );
}
