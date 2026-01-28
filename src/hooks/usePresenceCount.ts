import { useState, useEffect } from "react";

// Simulated presence count for MVP
// Will be replaced with real Supabase realtime when backend is enabled
export const usePresenceCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Generate a base count that changes slowly
    const baseCount = Math.floor(Math.random() * 50) + 80; // 80-130 base
    setCount(baseCount);

    // Simulate small fluctuations every 30-60 seconds
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const newCount = prev + delta;
        return Math.max(50, Math.min(200, newCount)); // Keep between 50-200
      });
    }, 30000 + Math.random() * 30000);

    return () => clearInterval(interval);
  }, []);

  return count;
};
