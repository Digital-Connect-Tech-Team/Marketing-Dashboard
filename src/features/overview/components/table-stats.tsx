'use client';
import { columns } from '@/app/dashboard/overview/@table_stats/columns';
import { DataTable } from '@/app/dashboard/overview/@table_stats/data-table';
import { useQuery } from '@tanstack/react-query';
import {
  ChartService,
  ChartDataItem,
  ResTableItem
} from '@/services/ChartDataService';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function TableStats() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  // ✅ โหลดข้อมูลจาก ChartService
  const {
    data = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['chartData'],
    queryFn: async () => {
      const chartData: ChartDataItem[] = await ChartService.fetchChartData();

      // ✅ ตรวจสอบว่า `chartData` เป็น array จริง ๆ
      if (!Array.isArray(chartData)) {
        console.error('❌ Chart data is not an array', chartData);
        return [];
      }

      // ✅ แปลง ChartDataItem[] เป็น ResTableItem[]
      return chartData.map((item, index) => ({
        rd: (index + 1).toString(),
        name: item.title ?? 'Unknown', // ✅ ป้องกัน `undefined`
        main: item.success?.toString() ?? '0', // ✅ ป้องกัน `undefined`
        sub: item.await?.toString() ?? '0', // ✅ ป้องกัน `undefined`
        total: ((item.success ?? 0) + (item.await ?? 0)).toString() // ✅ ป้องกัน `NaN`
      }));
    },
    staleTime: 1000 * 60 * 5 // Cache 5 นาที
  });

  if (isLoading) return <div>Loading data...</div>;
  if (error) return <div>Error loading data</div>;

  // ✅ กรองข้อมูลจาก search (ใช้ `?.toLowerCase()` ป้องกัน `undefined`)
  const filteredData = data.filter(
    (item) => item.name?.toLowerCase().includes(search.toLowerCase()) // ✅ ใช้ optional chaining
  );

  // ✅ จัดการ Pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className='space-y-8'>
      {/* ✅ Search Input */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder='Search...'
        className='mb-4'
      />

      {/* ✅ DataTable */}
      <DataTable
        columns={columns}
        data={paginatedData} // ✅ ใช้ข้อมูลที่ถูก filter และแบ่งหน้า
        page={page}
        pageSize={pageSize}
        totalPages={Math.ceil(filteredData.length / pageSize)}
        setPage={setPage}
        setPageSize={setPageSize}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
}
