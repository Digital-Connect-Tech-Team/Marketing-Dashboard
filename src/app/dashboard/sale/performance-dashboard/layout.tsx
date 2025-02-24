import PageContainer from '@/components/layout/page-container';
import React from 'react';
import { Button } from '@/components/ui/button';
import { SalePerformanceData } from '@/app/contexts/SalePerformanceContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import DateRangePicker from '@/features/sale/components/date-picker';
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

        {/* ✅ ครอบ DatePickerProvider ให้สามารถใช้ Context ได้ */}

        <SalePerformanceData>
          <div className='col-span-4'>{card_totals}</div>
          <div className='flex flex-row gap-4 py-2'>
            <DateRangePicker initialData={[]} />

            <Select>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Chanel' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value='apple'>Apple</SelectItem>
                  <SelectItem value='banana'>Banana</SelectItem>
                  <SelectItem value='blueberry'>Blueberry</SelectItem>
                  <SelectItem value='grapes'>Grapes</SelectItem>
                  <SelectItem value='pineapple'>Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Sub Chanel' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value='apple'>Apple</SelectItem>
                  <SelectItem value='banana'>Banana</SelectItem>
                  <SelectItem value='blueberry'>Blueberry</SelectItem>
                  <SelectItem value='grapes'>Grapes</SelectItem>
                  <SelectItem value='pineapple'>Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Sale' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value='apple'>Apple</SelectItem>
                  <SelectItem value='banana'>Banana</SelectItem>
                  <SelectItem value='blueberry'>Blueberry</SelectItem>
                  <SelectItem value='grapes'>Grapes</SelectItem>
                  <SelectItem value='pineapple'>Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button>Reset</Button>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8'>
            <div className='col-span-4'>{sale_bars}</div>
            <div className='col-span-4'></div>
          </div>
        </SalePerformanceData>
      </div>
    </PageContainer>
  );
}
