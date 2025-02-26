import { convertToExcelSerial } from './utils';

export function buildWhereClause(
  filters: any,
  session: any,
  mainChannelSession: string | null
) {
  let whereClause = `WHERE F IS NOT NULL`;

  // ✅ เงื่อนไขสำหรับ Date
  if (filters.type === 'date' && filters.from && !filters.to) {
    const fromDate = convertToExcelSerial(filters.from);
    whereClause += ` AND Q = '${fromDate}'`;
  }

  if (filters.type === 'date' && filters.from && filters.to) {
    const fromDate = convertToExcelSerial(filters.from);
    const toDate = convertToExcelSerial(filters.to);
    whereClause += ` AND Q BETWEEN '${fromDate}' AND '${toDate}'`;
  }

  // ✅ เงื่อนไขสำหรับ Month
  if (filters.type === 'month' && filters.months && filters.year) {
    const monthMapping: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11
    };

    const conditions = filters.months.map((month: string) => {
      const monthIndex = monthMapping[month];
      const year = Number(filters.year);
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0);
      return `(Q BETWEEN '${convertToExcelSerial(startDate.toISOString().split('T')[0])}' 
                    AND '${convertToExcelSerial(endDate.toISOString().split('T')[0])}')`;
    });

    if (conditions.length > 0) {
      whereClause += ` AND (${conditions.join(' OR ')})`;
    }
  }

  // ✅ เงื่อนไขสำหรับ Quarter
  if (filters.type === 'quarter' && filters.quarters && filters.year) {
    const quarterMapping: Record<
      string,
      { startMonth: number; endMonth: number }
    > = {
      Q1: { startMonth: 0, endMonth: 2 }, // Jan - Mar
      Q2: { startMonth: 3, endMonth: 5 }, // Apr - Jun
      Q3: { startMonth: 6, endMonth: 8 }, // Jul - Sep
      Q4: { startMonth: 9, endMonth: 11 } // Oct - Dec
    };

    const conditions = filters.quarters.map((quarter: string) => {
      const { startMonth, endMonth } = quarterMapping[quarter];
      const year = Number(filters.year);
      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth + 1, 0);
      return `(Q BETWEEN '${convertToExcelSerial(startDate.toISOString().split('T')[0])}' 
                    AND '${convertToExcelSerial(endDate.toISOString().split('T')[0])}')`;
    });

    if (conditions.length > 0) {
      whereClause += ` AND (${conditions.join(' OR ')})`;
    }
  }

  // ✅ เงื่อนไขสำหรับ Year
  if (filters.type === 'year' && filters.years) {
    const conditions = filters.years.map((yearStr: string) => {
      const year = Number(yearStr);
      return `(Q BETWEEN '${convertToExcelSerial(`${year}-01-01`)}' 
                    AND '${convertToExcelSerial(`${year}-12-31`)}')`;
    });

    if (conditions.length > 0) {
      whereClause += ` AND (${conditions.join(' OR ')})`;
    }
  }

  // ✅ เงื่อนไขสำหรับ Main Channel (เฉพาะ Role Master)
  if (
    Array.isArray(filters.mainChannels) &&
    filters.mainChannels.length > 0 &&
    session?.user?.role?.name === 'Master'
  ) {
    whereClause += ` AND (TRIM(S) = '${filters.mainChannels.map((main: string) => main).join("' OR TRIM(S) = '")}')`;
  }

  // ✅ เงื่อนไขสำหรับ Sub Channel
  if (Array.isArray(filters.subChannels) && filters.subChannels.length > 0) {
    whereClause += ` AND (TRIM(T) = '${filters.subChannels.map((sub: string) => sub).join("' OR TRIM(T) = '")}')`;
  }

  // ✅ เงื่อนไขสำหรับ Sales
  if (Array.isArray(filters.sales) && filters.sales.length > 0) {
    whereClause += ` AND (TRIM(W) = '${filters.sales.map((sale: string) => sale).join("' OR TRIM(W) = '")}')`;
  }

  // ✅ จำกัดให้เห็นเฉพาะ Main Channel ของ Session
  if (mainChannelSession) {
    whereClause += ` AND S = '${mainChannelSession}'`;
  }

  console.log(whereClause);

  return whereClause;
}
