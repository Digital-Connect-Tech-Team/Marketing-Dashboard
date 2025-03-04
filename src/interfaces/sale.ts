export type SaleRes = {
  RD: string;
  customerName?: string;
  phoneNumer?: string;
  mainChannel?: string;
  secondaryChannel?: string;
  workValue?: number;
  nurturingType?: string;
};

export type SaleTable = {
  rd: string;
  name: string;
  phone: string;
  main: string;
  sub: string;
  sale: string;
  total?: number;
};

export type FetchTableResult = {
  data: SaleTable[];
  totalData: number;
  currentPage: number;
  totalPages: number;
};

export type SaleBadgeStats = {
  title: string;
  value: number;
};
