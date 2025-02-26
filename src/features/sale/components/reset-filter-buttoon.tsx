'use client';
import { useSalePerformanceStore } from '@/app/contexts/useSalePerformanceStore';
import { Button } from '@/components/ui/button';
import React from 'react';

export default function ResetFilterButton() {
  const store = useSalePerformanceStore();
  return <Button onClick={() => store.resetAllFilters()}>Reset</Button>;
}
