export type TextDetect = {
  id: number;
  text: string;
};

export type DataContextType = {
  chartData: any;
  refreshChartData: () => Promise<void>;
};

export type FilterDate = {
  type: 'date' | 'month' | 'quarter' | 'year';
  from?: string;
  to?: string;
  months?: string[];
  quarters?: string[];
  years?: string[];
  year?: string;
};
