export type ChartDataItem = {
  title: string;
  success: number;
  await: number;
};

export type ResTableItem = {
  rd: string;
  name: string;
  main: string;
  sub: string;
  total: string;
};

export class ChartService {
  private static BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // ✅ ฟังก์ชันช่วยสร้าง URL พร้อมพารามิเตอร์
  private static buildUrl(
    endpoint: string,
    from?: Date,
    to?: Date,
    filters?: { mainChannel?: string; subChannel?: string; salePerson?: string }
  ) {
    const url = new URL(endpoint, this.BASE_URL);
    const params = url.searchParams;

    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());
    if (filters?.mainChannel) params.append('mainChannel', filters.mainChannel);
    if (filters?.subChannel) params.append('subChannel', filters.subChannel);
    if (filters?.salePerson) params.append('salePerson', filters.salePerson);

    return url.toString();
  }

  // ✅ ฟังก์ชันช่วย fetch ข้อมูล
  private static async fetchData(
    endpoint: string,
    from?: Date,
    to?: Date,
    filters?: { mainChannel?: string; subChannel?: string; salePerson?: string }
  ) {
    try {
      const url = this.buildUrl(endpoint, from, to, filters);
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      return { totalCount: 0 }; // Default ถ้า API ล้มเหลว
    }
  }

  static async fetchChartData(
    from?: Date,
    to?: Date,
    filters?: { mainChannel?: string; subChannel?: string; salePerson?: string }
  ): Promise<ChartDataItem[]> {
    console.log('📡 Fetching chart data with filters:', { from, to, filters });

    const endpoints = [
      'lead?status=all',
      'lead?status=surveyed',
      'lead?status=not_surveyed',
      'lead?status=quotation',
      'lead?status=not_quotation',
      // 'lead?status=nurturingHigh',
      // 'lead?status=nurturingMedium',
      // 'lead?status=nurturingLow',
      'lead?status=nurturingHML',
      'lead?status=nurturingOthers',
      'lead?status=nurturingWin',
      'lead?status=nurturingLoss'
    ];

    // ✅ ใช้ `Promise.all` ดึงข้อมูลพร้อมกัน
    const results = await Promise.all(
      endpoints.map((endpoint) => this.fetchData(endpoint, from, to, filters))
    );

    console.log('📊 Raw API Response:', results);

    // ✅ ใช้ `reduce` แทนการเข้าถึง index ตรง ๆ
    const dataMap = results.reduce(
      (acc, item, index) => {
        acc[index] = item.totalCount ?? 0;
        return acc;
      },
      {} as Record<number, number>
    );

    return [
      { title: 'Lead Sales', success: dataMap[0], await: 0 },
      { title: 'Survey', success: dataMap[1], await: dataMap[2] },
      { title: 'Quotation', success: dataMap[3], await: dataMap[4] },
      {
        title: 'Nurturing',
        success: dataMap[5],
        await: dataMap[6]
      },
      { title: 'Win/Loss', success: dataMap[7], await: dataMap[8] }
    ];
  }

  static async updateChartData(
    category: string,
    type: string,
    page: number = 1,
    pageSize: number = 10,
    activeBadge: string | null
  ): Promise<{
    data: ResTableItem[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      // ✅ ดึงค่าจาก `localStorage`
      const storedFilters =
        typeof window !== 'undefined'
          ? localStorage.getItem('selectedFilters')
          : null;
      const storedDateRange =
        typeof window !== 'undefined'
          ? localStorage.getItem('dateRange')
          : null;
      const filters = storedFilters ? JSON.parse(storedFilters) : {};
      const dateRange = storedDateRange ? JSON.parse(storedDateRange) : {};

      // ✅ กำหนดค่าเริ่มต้น ถ้า `localStorage` ไม่มีค่า
      const search = filters.search ?? '';
      const mainChannel = filters.mainChannel ?? '';
      const subChannel = filters.subChannel ?? '';
      const salePerson = filters.salePerson ?? '';
      const fromDate = dateRange.from
        ? new Date(dateRange.from).toISOString()
        : '';
      const toDate = dateRange.to ? new Date(dateRange.to).toISOString() : '';

      let status = '';
      if (category) {
        switch (category) {
          case 'Lead Sales':
            status = 'all';
            break;
          case 'Survey':
            status = type === 'success' ? 'surveyed' : 'not_surveyed';
            break;
          case 'Quotation':
            status = type === 'success' ? 'quotation' : 'not_quotation';
            break;
          case 'Nurturing':
            status = type === 'success' ? 'nurturingHML' : 'nurturingOthers';
            if (status === 'nurturingHML') {
              if (activeBadge === 'Total') {
                status = 'nurturingHML';
              } else if (activeBadge === 'High') {
                status = 'nurturingHigh';
              } else if (activeBadge === 'Medium') {
                status = 'nurturingMedium';
              } else if (activeBadge === 'Low') {
                status = 'nurturingLow';
              }
            }
            break;
          case 'Win/Loss':
            status = type === 'success' ? 'nurturingWin' : 'nurturingLoss';
            break;
        }
      }

      const url = new URL(`${this.BASE_URL}/api/lead`);
      url.searchParams.append('status', status);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('pageSize', pageSize.toString());
      if (search.trim() !== '') url.searchParams.append('search', search);
      if (mainChannel !== '')
        url.searchParams.append('mainChannel', mainChannel);
      if (subChannel !== '') url.searchParams.append('subChannel', subChannel);
      if (salePerson !== '') url.searchParams.append('salePerson', salePerson);
      if (fromDate !== '') url.searchParams.append('from', fromDate);
      if (toDate !== '') url.searchParams.append('to', toDate);

      console.log('📡 Fetching data from:', url.toString());

      // ✅ ทำ `GET` Request ไปที่ API
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('API request failed');

      const result = await response.json();

      const totalCount = result.totalCount ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: result.data || [],
        total: result.total ?? result.data.length ?? 10, // ✅ ใช้ default 10 ถ้าไม่มีค่า
        currentPage: page,
        totalPages: totalPages
      };
    } catch (error) {
      console.error('❌ Error fetching lead sale count:', error);
      return { data: [], total: 0, currentPage: 1, totalPages: 1 };
    }
  }

  static async fetchNurturingCount(
    type: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ count: number }> {
    try {
      // ✅ ดึงค่าจาก `localStorage`
      const storedFilters =
        typeof window !== 'undefined'
          ? localStorage.getItem('selectedFilters')
          : null;
      const storedDateRange =
        typeof window !== 'undefined'
          ? localStorage.getItem('dateRange')
          : null;
      const filters = storedFilters ? JSON.parse(storedFilters) : {};
      const dateRange = storedDateRange ? JSON.parse(storedDateRange) : {};

      // ✅ กำหนดค่าเริ่มต้น ถ้า `localStorage` ไม่มีค่า
      const search = filters.search ?? '';
      const mainChannel = filters.mainChannel ?? '';
      const subChannel = filters.subChannel ?? '';
      const salePerson = filters.salePerson ?? '';
      const fromDate = dateRange.from
        ? new Date(dateRange.from).toISOString()
        : '';
      const toDate = dateRange.to ? new Date(dateRange.to).toISOString() : '';

      // ✅ กำหนด `status` ให้ตรงกับ `type`
      let status = '';
      switch (type) {
        case 'Total':
          status = 'nurturingHML';
          break;
        case 'High':
          status = 'nurturingHigh';
          break;
        case 'Medium':
          status = 'nurturingMedium';
          break;
        case 'Low':
          status = 'nurturingLow';
          break;
        default:
          throw new Error(`Invalid type: ${type}`);
      }

      const url = new URL(`${this.BASE_URL}/api/lead`);
      url.searchParams.append('status', status);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('pageSize', pageSize.toString());
      if (search.trim() !== '') url.searchParams.append('search', search);
      if (mainChannel !== '')
        url.searchParams.append('mainChannel', mainChannel);
      if (subChannel !== '') url.searchParams.append('subChannel', subChannel);
      if (salePerson !== '') url.searchParams.append('salePerson', salePerson);
      if (fromDate !== '') url.searchParams.append('from', fromDate);
      if (toDate !== '') url.searchParams.append('to', toDate);

      console.log(
        `📡 Fetching nurturing count: ${type} from ${url.toString()}`
      );

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`API request failed for type ${type}`);

      const result = await response.json();
      return { count: result.totalCount ?? 0 };
    } catch (error) {
      console.error(`❌ Error fetching nurturing count for ${type}:`, error);
      return { count: 0 };
    }
  }
}
