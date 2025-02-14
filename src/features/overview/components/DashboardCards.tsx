import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCardsProps {
  data: any[];
  isLoading: boolean;
}

export default function DashboardCards({
  data = [],
  isLoading
}: DashboardCardsProps) {
  const titles = [
    'Total Lead Sale',
    'Total Survey',
    'Total Quotation',
    'Total Nurturing',
    'Total Win'
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {titles.map((title, index) => (
        <Card key={index}>
          <CardHeader className='flex justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? 'Loading...' : (data?.[index]?.success ?? 0)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
