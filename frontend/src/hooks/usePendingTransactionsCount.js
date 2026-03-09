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
        const transactions = await api.getAdminTransactions(token);
        const pending = transactions.filter(t => t.status === 'processing').length;
        setCount(pending);
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
