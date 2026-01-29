import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
}

const LOCAL_STREAK_KEY = "focuu_streak";

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      setIsLoading(true);
      
      if (user) {
        const { data, error } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          setStreak({
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            lastSessionDate: data.last_session_date,
          });
        }
      } else {
        // Load from localStorage for anonymous users
        const stored = localStorage.getItem(LOCAL_STREAK_KEY);
        if (stored) {
          try {
            setStreak(JSON.parse(stored));
          } catch {
            localStorage.removeItem(LOCAL_STREAK_KEY);
          }
        }
      }
      setIsLoading(false);
    };

    fetchStreak();
  }, [user]);

  // Update streak (call when session is completed)
  const updateStreak = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    
    if (user) {
      // Use database function
      const { data, error } = await supabase.rpc("update_user_streak", {
        p_user_id: user.id,
      });

      if (!error && data !== null) {
        setStreak((prev) => ({
          ...prev,
          currentStreak: data,
          longestStreak: Math.max(prev.longestStreak, data),
          lastSessionDate: today,
        }));
        return data;
      }
    } else {
      // Update locally
      setStreak((prev) => {
        let newStreak: StreakData;
        
        if (prev.lastSessionDate === today) {
          // Already updated today
          newStreak = prev;
        } else if (prev.lastSessionDate === getYesterday()) {
          // Consecutive day
          const newCurrentStreak = prev.currentStreak + 1;
          newStreak = {
            currentStreak: newCurrentStreak,
            longestStreak: Math.max(prev.longestStreak, newCurrentStreak),
            lastSessionDate: today,
          };
        } else {
          // Streak broken or first day
          newStreak = {
            currentStreak: 1,
            longestStreak: Math.max(prev.longestStreak, 1),
            lastSessionDate: today,
          };
        }
        
        localStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(newStreak));
        return newStreak;
      });
    }
  }, [user]);

  // Check if streak is active today
  const isStreakActiveToday = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return streak.lastSessionDate === today;
  }, [streak.lastSessionDate]);

  // Check if streak is at risk (no session yesterday or today)
  const isStreakAtRisk = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = getYesterday();
    return streak.lastSessionDate !== today && streak.lastSessionDate !== yesterday;
  }, [streak.lastSessionDate]);

  return {
    streak,
    isLoading,
    updateStreak,
    isStreakActiveToday,
    isStreakAtRisk,
  };
};

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}
