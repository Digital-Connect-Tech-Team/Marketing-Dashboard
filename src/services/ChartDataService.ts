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
  private static BASE_URL = 'http://localhost:3000/api/';

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
      'lead?status=nurturingHigh',
      'lead?status=nurturingMedium',
      'lead?status=nurturingLow',
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
        success: dataMap[5] + dataMap[6] + dataMap[7],
        await: dataMap[8]
      },
      { title: 'Win/Loss', success: dataMap[9], await: dataMap[10] }
    ];
  }

  // static async fetchLeadSaleCount(
  //     page: number,
  //     pageSize: number,
  //     search: string
  // ): Promise<{ data: ResTableItem[]; total: number }> {
  //     try {
  //         // const url = new URL("http://localhost:3000/api/lead?status=all");
  //         // url.searchParams.append("page", page.toString());
  //         // url.searchParams.append("pageSize", pageSize.toString());
  //         // if (search.trim() !== "") {
  //         //     url.searchParams.append("search", search);
  //         // }

  //         // console.log("📡 Fetching:", url.toString()); // ✅ Debugging

  //         // const response = await fetch(url.toString());
  //         // if (!response.ok) throw new Error("API request failed");

  //         // const result = await response.json();
  //         // console.log("📊 API Response:", result); // ✅ Debugging

  //         // C6: true,  // เลือก RD
  //         // C7: true,  // เลือก ชื่อลูกค้า
  //         // C8: true,  // เลือก เบอร์โทร
  //         // C19: true, // เลือก ช่องทางขายหลัก
  //         // C20: true, // เลือก ช่องทางขายรอง
  //         // C74: true, // เลือก มูลค่างาน

  //         // F AS RD,
  //         // G AS customerName,
  //         // H AS phoneNumber,
  //         // S AS mainChannel,
  //         // T AS secondaryChannel,
  //         // BV AS workValue

  //         // return {
  //         //     data: result.data.map((item: any) => ({
  //         //         rd: item.F,
  //         //         name: item.G,
  //         //         main: item.S,
  //         //         sub: item.T,
  //         //         total: item.BV,
  //         //     })),
  //         //     total: result.totalCount,
  //         // };
  //     } catch (error) {
  //         console.error("❌ Error fetching lead sale count:", error);
  //         return { data: [], total: 0 };
  //     }
  // }
}
