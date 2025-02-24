import { create } from 'zustand';
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

interface SalePerformanceState {
  chartData: any;
  setChartData: (data: any) => void;
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
  toggleYearSelection: (year: string) => void;

  resetFilters: () => void;
}

export const useSalePerformanceStore = create<SalePerformanceState>(
  (set, get) => ({
    chartData: null,
    setChartData: (data) => set({ chartData: data }),

    refreshChartData: async () => {
      console.log('🔄 Fetching new chart data...');
      try {
        const response = await fetch('/api/lead/count', {
          method: 'GET'
        });
        if (!response.ok) {
          console.error('Error fetching data:', response.statusText);
          return;
        }
        const newChartData = await response.json();
        set({ chartData: newChartData });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    },

    dateRange: { from: undefined, to: undefined },
    setDateRange: (date) => set({ dateRange: date }),

    selectedMonthYear: {
      months: [],
      year: new Date().getFullYear().toString()
    },
    toggleMonthSelection: (month) =>
      set((state) => ({
        selectedMonthYear: {
          ...state.selectedMonthYear,
          months: state.selectedMonthYear.months.includes(month)
            ? state.selectedMonthYear.months.filter((m) => m !== month)
            : [...state.selectedMonthYear.months, month]
        }
      })),
    setSelectedMonthYear: (data) => set({ selectedMonthYear: data }),

    selectedQuarterYear: {
      quarters: [],
      year: new Date().getFullYear().toString()
    },
    toggleQuarterSelection: (quarter) =>
      set((state) => ({
        selectedQuarterYear: {
          ...state.selectedQuarterYear,
          quarters: state.selectedQuarterYear.quarters.includes(quarter)
            ? state.selectedQuarterYear.quarters.filter((q) => q !== quarter)
            : [...state.selectedQuarterYear.quarters, quarter]
        }
      })),
    setSelectedQuarterYear: (data) => set({ selectedQuarterYear: data }),

    selectedYears: [],
    toggleYearSelection: (year) =>
      set((state) => ({
        selectedYears: state.selectedYears.includes(year)
          ? state.selectedYears.filter((y) => y !== year)
          : [...state.selectedYears, year]
      })),

    resetFilters: () =>
      set((state) => ({
        dateRange: undefined,
        selectedMonthYear: {
          months: [],
          year: new Date().getFullYear().toString()
        },
        selectedQuarterYear: {
          quarters: [],
          year: new Date().getFullYear().toString()
        },
        selectedYears: []
      }))
  })
);
