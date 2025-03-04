import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// import fs from 'fs';
import path from 'path';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

export function convertToExcelSerial(
  isoDate: string,
  force1904: boolean = false
): number {
  if (!isoDate) return 0; // ป้องกันค่าที่ว่างเปล่า

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return 0;

  const usDateString = date.toLocaleDateString('en-US');

  const excelEpoch = force1904
    ? new Date(Date.UTC(1904, 0, 1))
    : new Date(Date.UTC(1899, 11, 30));
  const diffTime = date.getTime() - excelEpoch.getTime();

  return Math.floor(diffTime / 86400000) + (force1904 ? 0 : 1);
}

export function convertFromExcelSerial(serial: number): string {
  const is1904 = serial >= 1462;

  const excelEpoch = is1904
    ? new Date(Date.UTC(1904, 0, 1))
    : new Date(Date.UTC(1899, 11, 30));
  const adjustedSerial = is1904 ? serial : serial - 1;
  const convertedDate = new Date(
    excelEpoch.getTime() + adjustedSerial * 86400000
  );

  return convertedDate.toISOString().split('T')[0];
}
