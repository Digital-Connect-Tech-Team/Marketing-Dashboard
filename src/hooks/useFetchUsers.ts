import { useState, useEffect } from 'react';

interface UserProfile {
  name: string;
}

export function useFetchUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/user/profile?page=1&pageSize=10');
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        setUsers(await response.json());
      } catch (error) {
        setFetchError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, fetchError };
}
