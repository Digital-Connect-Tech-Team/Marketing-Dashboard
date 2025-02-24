import { FilterDate } from '@/interfaces/global';
import { useQuery } from '@tanstack/react-query';

const SECRET_KEY = process.env.JWT_SECRET as string;
const fetchChartData = async (filters: FilterDate) => {
  // const jwtResponse = await fetch('/api/encode-jwt', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(filters)
  // });

  // if (!jwtResponse.ok) throw new Error('Failed to encode filters');
  // const { token } = await jwtResponse.json();

  // ✅ ใช้ JWT Token ส่งไปยัง API `/api/lead`
  const response = await fetch('/api/lead/count', {
    method: 'GET',
    headers: {
      // Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to fetch chart data');
  return response.json();
};

export function useSaleChartData(filters?: any) {
  return useQuery({
    queryKey: ['chartData', filters],
    queryFn: () => fetchChartData(filters),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!filters
  });
}
