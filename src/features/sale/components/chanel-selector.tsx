'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface ChannelSelectProps {
  type: 'main' | 'sub' | 'sale';
}

interface Channel {
  name: string;
}

interface Sale {
  id: string;
  amount: number;
}

export default function ChannelSelect({ type }: ChannelSelectProps) {
  const { data: session, status } = useSession();

  console.log(session);
  console.log(type);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | false>(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  // ❇️ โหลดข้อมูลจาก API
  useEffect(() => {
    setTimeout(() => {
      try {
        if (session?.user.role.name === 'Master') {
          if (type === 'sale') {
            // ✅ จำลองข้อมูล Sale
            const fetchedSales: Sale[] = [
              { id: 'S001', amount: 1000 },
              { id: 'S002', amount: 2500 }
            ];
            setSales(fetchedSales);
          } else {
            // ✅ จำลองข้อมูล Channel
            const fetchedChannels =
              type === 'main'
                ? [{ name: 'Main Channel 1' }, { name: 'Main Channel 2' }]
                : [{ name: 'Sub Channel A' }, { name: 'Sub Channel B' }];

            setChannels(fetchedChannels);
          }
        } else {
          if (type === 'sale') {
            // ✅ จำลองข้อมูล Sale
            const fetchedSales: Sale[] = [
              { id: 'S001', amount: 1000 },
              { id: 'S002', amount: 2500 }
            ];
            setSales(fetchedSales);
          } else {
            const fetchedChannels =
              type === 'main'
                ? [{ name: `${session?.user.domain.main_chanel}` }]
                : [{ name: 'Sub Channel A' }, { name: 'Sub Channel B' }];
            if (type === 'main') {
              setSelected(`${session?.user.domain.main_chanel}`);
            }
            setChannels(fetchedChannels);
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    }, 1000);
  }, [type]);

  return (
    <Select
      value={selected}
      onValueChange={setSelected}
      disabled={
        type === 'main' && session?.user.role.name !== 'Master' ? true : false
      }
    >
      <SelectTrigger className='w-full'>
        <SelectValue
          placeholder={`${type === 'main' ? 'Channels' : type === 'sub' ? 'Sub Channels' : 'Sale'}`}
        />
      </SelectTrigger>
      <SelectContent className='max-h-60 overflow-auto'>
        <SelectGroup>
          {loading ? (
            <SelectItem disabled value='loading'>
              Loading...
            </SelectItem>
          ) : error ? (
            <SelectItem disabled value='error'>
              {error}
            </SelectItem>
          ) : type === 'sale' ? (
            sales.length > 0 ? (
              sales.map((sale, i) => (
                <SelectItem key={i} value={sale.id}>
                  Sale {sale.id} - ${sale.amount}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value='no-data'>
                No Sales Found
              </SelectItem>
            )
          ) : channels.length > 0 ? (
            channels.map((ch, i) => (
              <SelectItem key={i} value={ch.name}>
                {ch.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value='no-data'>
              No {type} channel found
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
