import { useState, useEffect } from 'react';

interface ChannelProfile {
  name: string;
}

export function useFetchChannels() {
  const [mainChannel, setMainChannel] = useState<ChannelProfile[]>([]);
  const [subChannel, setSubChannel] = useState<ChannelProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels(
      status: string,
      setter: (data: ChannelProfile[]) => void
    ) {
      try {
        const response = await fetch(`/api/channels?status=${status}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const result = await response.json();
        setter(result ?? []); // ✅ ป้องกัน undefined
      } catch (error) {
        setFetchError('Failed to load channels');
      } finally {
        setLoading(false);
      }
    }

    fetchChannels('main', setMainChannel);
    fetchChannels('sub', setSubChannel);
  }, []);

  return { mainChannel, subChannel, loading, fetchError };
}
