import { create } from 'zustand';
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

  selectedType: string;
  setSelectedType: (type: string) => void;

  resetDateFilters: () => void;

  selectedMainChannel: string[];
  setSelectedMainChannel: (main: string[]) => void;

  selectedSubChannel: string[];
  setSelectedSubChannel: (sub: string[]) => void;

  selectedSaleChannel: string[];
  setSelectedSaleChannel: (sale: string[]) => void;

  availableMainChannels: string[];
  availableSubChannels: string[];
  availableSales: string[];

  fetchData: () => Promise<void>;

  fetchSales: () => Promise<void>;

  fetchChannels: () => Promise<void>;

  resetChannel: (
    type: 'all' | 'main' | 'sub' | 'sale' | ('main' | 'sub' | 'sale')[]
  ) => void;

  resetAllFilters: () => void;
}

export const useSalePerformanceStore = create<SalePerformanceState>(
  (set, get) => ({
    chartData: null,
    setChartData: (data) => set({ chartData: data }),

    refreshChartData: async () => {
      console.log('🔄 Fetching new chart data...');
      const {
        selectedType,
        dateRange,
        selectedMonthYear,
        selectedQuarterYear,
        selectedYears,
        selectedMainChannel,
        selectedSubChannel,
        selectedSaleChannel
      } = get();

      const filters = {
        type: selectedType,
        from: dateRange?.from,
        to: dateRange?.to,
        year: selectedMonthYear.year ?? selectedQuarterYear.year,
        months: selectedMonthYear.months ?? [],
        quarters: selectedQuarterYear.quarters ?? [],
        years: selectedYears ?? [],
        mainChannels: selectedMainChannel ?? [],
        subChannels: selectedSubChannel ?? [],
        sales: selectedSaleChannel ?? []
      };
      try {
        const response = await fetch('/api/lead/count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: filters })
        });
        if (!response.ok) throw new Error('Failed to fetch channels');

        const newChartData = await response.json();
        set({ chartData: newChartData });
      } catch (error) {
        console.error('❌ Error fetching channels:', error);
      }
      get().fetchChannels();
      get().fetchSales();
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

    selectedType: 'date',
    setSelectedType: (type) => set({ selectedType: type }),

    selectedMainChannel: [],
    setSelectedMainChannel: (mainArray) =>
      set({ selectedMainChannel: mainArray }),

    selectedSubChannel: [],
    setSelectedSubChannel: (subArray) => set({ selectedSubChannel: subArray }),

    selectedSaleChannel: [],
    setSelectedSaleChannel: (saleArray) =>
      set({ selectedSaleChannel: saleArray }),

    resetAllFilters: () => {
      get().resetDateFilters();
      get().resetChannel('all');
      get().fetchData();
    },

    resetDateFilters: () =>
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
      })),

    resetChannel: (type) => {
      set((state) => {
        let newState = { ...state };

        if (type === 'all') {
          newState = {
            ...newState,
            selectedMainChannel: [],
            selectedSubChannel: [],
            selectedSaleChannel: []
          };
        } else if (Array.isArray(type)) {
          if (type.includes('main')) newState.selectedMainChannel = [];
          if (type.includes('sub')) newState.selectedSubChannel = [];
          if (type.includes('sale')) newState.selectedSaleChannel = [];
        } else {
          if (type === 'main') newState.selectedMainChannel = [];
          if (type === 'sub') newState.selectedSubChannel = [];
          if (type === 'sale') newState.selectedSaleChannel = [];
        }

        return newState;
      });

      get().fetchChannels();
      get().fetchSales();
    },

    fetchData: async () => {
      const {
        selectedType,
        dateRange,
        selectedMonthYear,
        selectedQuarterYear,
        selectedYears,
        selectedMainChannel,
        selectedSubChannel,
        selectedSaleChannel
      } = get();

      const filters = {
        type: selectedType,
        from: dateRange?.from,
        to: dateRange?.to,
        year: selectedMonthYear.year ?? selectedQuarterYear.year,
        months: selectedMonthYear.months ?? [],
        quarters: selectedQuarterYear.quarters ?? [],
        years: selectedYears ?? [],
        mainChannels: selectedMainChannel ?? [],
        subChannels: selectedSubChannel ?? [],
        sales: selectedSaleChannel ?? []
      };
      try {
        const response = await fetch('/api/lead/count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: filters })
        });
        if (!response.ok) throw new Error('Failed to fetch channels');

        const newChartData = await response.json();
        set({ chartData: newChartData });
      } catch (error) {
        console.error('❌ Error fetching channels:', error);
      }
      get().fetchChannels();
      get().fetchSales();
    },

    availableMainChannels: [],
    availableSubChannels: [],
    fetchChannels: async () => {
      const {
        selectedType,
        dateRange,
        selectedMonthYear,
        selectedQuarterYear,
        selectedYears,
        selectedMainChannel,
        selectedSubChannel,
        selectedSaleChannel
      } = get();

      const filters = {
        type: selectedType,
        from: dateRange?.from,
        to: dateRange?.to,
        year: selectedMonthYear.year ?? selectedQuarterYear.year,
        months: selectedMonthYear.months ?? [],
        quarters: selectedQuarterYear.quarters ?? [],
        years: selectedYears ?? [],
        mainChannels: selectedMainChannel ?? [],
        subChannels: selectedSubChannel ?? [],
        sales: selectedSaleChannel ?? []
      };
      try {
        const response = await fetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters })
        });
        if (!response.ok) throw new Error('Failed to fetch channels');

        const data = await response.json();
        console.log(data);

        const mainChannels = Array.isArray(data.main) ? data.main : [];
        const subChannels = Array.isArray(data.sub) ? data.sub : [];

        set({
          availableMainChannels: mainChannels,
          availableSubChannels: subChannels
        });
      } catch (error) {
        console.error('❌ Error fetching channels:', error);
      }
    },

    availableSales: [],
    fetchSales: async () => {
      const {
        selectedType,
        dateRange,
        selectedMonthYear,
        selectedQuarterYear,
        selectedYears,
        selectedMainChannel,
        selectedSubChannel,
        selectedSaleChannel
      } = get();

      const filters = {
        type: selectedType,
        from: dateRange?.from,
        to: dateRange?.to,
        year: selectedMonthYear.year ?? selectedQuarterYear.year,
        months: selectedMonthYear.months ?? [],
        quarters: selectedQuarterYear.quarters ?? [],
        years: selectedYears ?? [],
        mainChannels: selectedMainChannel ?? [],
        subChannels: selectedSubChannel ?? [],
        sales: selectedSaleChannel ?? []
      };

      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters })
        });

        if (!response.ok) throw new Error('Failed to fetch sales');

        const salesData = await response.json();
        set({ availableSales: salesData });
      } catch (error) {
        console.error('❌ Error fetching sales:', error);
      }
    }
  })
);
