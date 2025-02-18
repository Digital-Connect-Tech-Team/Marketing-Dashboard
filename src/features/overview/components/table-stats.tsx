'use client';

import { useState, useEffect, useMemo } from 'react';
import { columns } from '@/app/dashboard/overview/@table_stats/columns';
import { DataTable } from '@/app/dashboard/overview/@table_stats/data-table';
import ChartService from '@/server/ChartDataService';
import { Badge } from '@/components/ui/badge';
import { CardWinLoss } from './CardWinLoss';

export function TableStats() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(10);
  const [tableData, setTableData] = useState<any[]>([]);
  const [activeBadge, setActiveBadge] = useState<string>('Total');
  const [nurturingCount, setNurturingCount] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [selectedFilter, setSelectedFilter] = useState<{
    category: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    // โหลดค่าจาก localStorage
    const storedFilter = localStorage.getItem('selectedBar');
    if (storedFilter) setSelectedFilter(JSON.parse(storedFilter));

    // ✅ ตรวจจับ event `storage` เพื่อให้ table โหลดข้อมูลใหม่
    const handleStorageChange = () => {
      const updatedFilter = localStorage.getItem('selectedBar');
      if (updatedFilter) {
        setSelectedFilter(JSON.parse(updatedFilter));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!selectedFilter) return;

    const fetchData = async () => {
      try {
        const result = await ChartService.updateChartData(
          selectedFilter.category,
          selectedFilter.type,
          page,
          pageSize,
          activeBadge
        );

        console.log('📊 API Response:', result);

        if (!result || !result.data || !Array.isArray(result.data)) {
          console.error('❌ Invalid API response:', result);
          return;
        }

        setPage(result.currentPage);
        setPageSize(Math.max(result.total, 10));
        setTotalPage(result.totalPages ?? 1);
        setTableData(result.data);
      } catch (error) {
        console.error('❌ Error updating chart data:', error);
      }
    };

    fetchData();
  }, [selectedFilter, page, pageSize, activeBadge]);

  useEffect(() => {
    if (selectedFilter?.category !== 'Nurturing') return;

    const fetchNurturingCounts = async () => {
      try {
        const [totalRes, highRes, mediumRes, lowRes] = await Promise.all([
          ChartService.fetchNurturingCount('Total'),
          ChartService.fetchNurturingCount('High'),
          ChartService.fetchNurturingCount('Medium'),
          ChartService.fetchNurturingCount('Low')
        ]);

        setNurturingCount({
          total: totalRes.count ?? 0,
          high: highRes.count ?? 0,
          medium: mediumRes.count ?? 0,
          low: lowRes.count ?? 0
        });

        console.log('📊 Nurturing Count Updated:', {
          totalRes,
          highRes,
          mediumRes,
          lowRes
        });
      } catch (error) {
        console.error('❌ Error fetching nurturing count:', error);
      }
    };

    fetchNurturingCounts();
  }, [selectedFilter]);

  return (
    <div className='gap-y-8'>
      {selectedFilter?.category === 'Win/Loss' &&
      selectedFilter?.type === 'await' ? (
        <>
          <CardWinLoss />
        </>
      ) : (
        <>
          {selectedFilter?.category === 'Nurturing' && (
            <div>
              <div className='text-lg font-semibold'>Nurturing Summary</div>
              <div className='flex justify-center gap-4 py-2'>
                <Badge
                  variant='outline'
                  className={`py-2 ${activeBadge === 'Total' ? 'border-2 bg-white text-gray-950' : ''}`}
                  onClick={() => setActiveBadge('Total')}
                >
                  Total ({nurturingCount.total})
                </Badge>
                <Badge
                  variant='outline'
                  className={`py-2 ${activeBadge === 'High' ? 'border-2 bg-green-700 text-white' : 'border-green-700 text-green-700'}`}
                  onClick={() => setActiveBadge('High')}
                >
                  High ({nurturingCount.high})
                </Badge>
                <Badge
                  variant='outline'
                  className={`py-2 ${activeBadge === 'Medium' ? 'border-2 bg-yellow-400 text-gray-950' : 'border-yellow-400 text-yellow-400'}`}
                  onClick={() => setActiveBadge('Medium')}
                >
                  Medium ({nurturingCount.medium})
                </Badge>
                <Badge
                  variant='outline'
                  className={`py-2 ${activeBadge === 'Low' ? 'border-2 bg-red-700 text-white' : 'border-red-700 text-red-700'}`}
                  onClick={() => setActiveBadge('Low')}
                >
                  Low ({nurturingCount.low})
                </Badge>
              </div>
            </div>
          )}

          <DataTable
            columns={columns}
            data={tableData}
            page={page}
            pageSize={pageSize}
            totalPages={totalPage}
            setPage={setPage}
            setPageSize={(newPageSize) => {
              console.log('📌 Changing pageSize to:', newPageSize);
              setPageSize(Math.max(newPageSize, 10));
            }}
          />
        </>
      )}
    </div>
  );
}
