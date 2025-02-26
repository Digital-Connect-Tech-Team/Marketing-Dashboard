import PageContainer from '@/components/layout/page-container';
import React from 'react';
import { Button } from '@/components/ui/button';
import DateRangePicker from '@/features/sale/components/date-picker';
import ChannelSelect from '@/features/sale/components/channel-selector';
export default async function OverViewLayout({
  card_totals,
  sale_bars
}: {
  card_totals: React.ReactNode;
  sale_bars: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        {/* Header */}
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

          <Button>Reset</Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8'>
          <div className='col-span-4'>{sale_bars}</div>
          <div className='col-span-4'></div>
        </div>
      </div>
    </PageContainer>
  );
}
