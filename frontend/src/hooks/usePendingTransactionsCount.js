import { useState, useEffect } from 'react';
import { api } from '../api';

const POLLING_INTERVAL = 15000; // 15 seconds

export function usePendingTransactionsCount(token) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setCount(0);
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      try {
        const stats = await api.getAdminTransactionsStats(token);
        const pendingCount = stats.counts?.processing || 0;
        setCount(pendingCount);
      } catch (err) {
        console.error("Failed to fetch pending transactions count:", err);
        setCount(0); // Reset count on error
      } finally {
        setLoading(false);
      }
    };

    fetchCount(); // Fetch immediately on mount
    const intervalId = setInterval(fetchCount, POLLING_INTERVAL); // Set up polling
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [token]);

  return { count, loading };
}
