import PageContainer from '@/components/layout/page-container';
import React from 'react';
import { Button } from '@/components/ui/button';
import DateRangePicker from '@/features/sale/components/date-picker';
import ChannelSelect from '@/features/sale/components/channel-selector';
import ResetFilterButton from '@/features/sale/components/reset-filter-buttoon';
import Image from 'next/image';
export default async function OverViewLayout({
  card_totals,
  sale_bars,
  sale_table
}: {
  card_totals: React.ReactNode;
  sale_bars: React.ReactNode;
  sale_table: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        {/* Header */}
        <div className='relative h-[100] w-[200]'>
          <Image
            src='/images/logo/Onnex_Logo.jpg'
            alt='Onnex Logo'
            width={250}
            height={150}
            className='justify-self-center'
          />
        </div>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Sale Performance Dashboard
          </h2>
          <div className='grid grid-cols-2 gap-2'>
            <Button variant='secondary'>จำนวนเงิน</Button>
            <Button>จำนวนลูกค้า</Button>
          </div>
        </div>

        {/* Subtitle */}
        <h2 className='text-1xl font-thin tracking-tight'>
          Product : SCG Solar Roof Solution I OB : Own build
        </h2>

        <div className='col-span-4'>{card_totals}</div>
        <div className='flex flex-row gap-4 py-2'>
          <DateRangePicker initialData={[]} />

          <ChannelSelect type='main' />

          <ChannelSelect type='sub' />

          <ChannelSelect type='sale' />

          <ResetFilterButton />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8'>
          <div className='col-span-4'>{sale_bars}</div>
          <div className='col-span-4 max-h-[550px] overflow-auto'>
            {sale_table}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
