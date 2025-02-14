import { delay } from '@/constants/mock-api';
import { TableStats } from '@/features/overview/components/table-stats';

export default async function Sales() {
  await delay(3000);
  return <TableStats />;
}
