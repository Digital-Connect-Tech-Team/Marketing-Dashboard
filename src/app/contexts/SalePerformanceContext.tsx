'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import ChartService from '@/server/ChartDataService';
import { DateRange } from 'react-day-picker';

interface SelectedMonthYearType {
  months: string[];
  year: string;
}

interface SelectedQuarterYearType {
  quarters: string[];
  year: string;
}

interface SalePerformanceType {
  chartData: any;
  refreshChartData: () => Promise<void>;

  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;

  selectedMonthYear: SelectedMonthYearType;
  toggleMonthSelection: (month: string) => void;
  setSelectedMonthYear: (data: SelectedMonthYearType) => void;

  selectedQuarterYear: SelectedQuarterYearType;
  toggleQuarterSelection: (quarter: string) => void;
  setSelectedQuarterYear: (data: SelectedQuarterYearType) => void;

  selectedYears: string[];
  toggleYearSelection: (yesr: string) => void;
}

const SalePerformance = createContext<SalePerformanceType | undefined>(
  undefined
);

export function SalePerformanceData({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear().toString();
  const [chartData, setChartData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined
  });

  const [selectedMonthYear, setSelectedMonthYear] =
    useState<SelectedMonthYearType>({
      months: [],
      year: currentYear
    });

  const [selectedQuarterYear, setSelectedQuarterYear] =
    useState<SelectedQuarterYearType>({
      quarters: [],
      year: currentYear
    });

  const toggleMonthSelection = (month: string) => {
    setSelectedMonthYear((prev) => ({
      ...prev,
      months: prev.months.includes(month)
        ? prev.months.filter((m) => m !== month)
        : [...prev.months, month]
    }));
  };

  const toggleQuarterSelection = (quarter: string) => {
    setSelectedQuarterYear((prev) => ({
      ...prev,
      quarters: prev.quarters.includes(quarter)
        ? prev.quarters.filter((q) => q !== quarter)
        : [...prev.quarters, quarter]
    }));
  };

  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const toggleYearSelection = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((m) => m !== year) : [...prev, year]
    );
  };

  async function refreshChartData() {
    try {
      const response = await fetch('/api/lead/count', {
        method: 'GET'
      });
      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }
      const newChartData = await response.json();
      setChartData(newChartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }

  useEffect(() => {
    refreshChartData();
  }, []);

  return (
    <SalePerformance.Provider
      value={{
        chartData,
        refreshChartData,
        dateRange,
        setDateRange,
        selectedMonthYear,
        toggleMonthSelection,
        setSelectedMonthYear,
        selectedQuarterYear,
        toggleQuarterSelection,
        setSelectedQuarterYear,
        selectedYears,
        toggleYearSelection
      }}
    >
      {children}
    </SalePerformance.Provider>
  );
}

export function useSalePerformance() {
  const context = useContext(SalePerformance);
  if (!context) {
    throw new Error(
      'useSalePerformance must be used within SalePerformanceData'
    );
  }
  return context;
}
