import { useState, useEffect, useCallback } from "react";
import { supabase, Session } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EnergyMode } from "./useSessionTimer";

export interface SessionRecord {
  id: string;
  date: string;
  energyMode: EnergyMode;
  intent: string | null;
  durationMinutes: number;
  completedAt: string;
}

interface DaySummary {
  date: string;
  sessionsCount: number;
  totalMinutes: number;
}

const LOCAL_STORAGE_KEY = "focuu_sessions";

export const useSessionHistory = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch sessions from Supabase if logged in, otherwise from localStorage
  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(100);

        if (!error && data) {
          const mapped: SessionRecord[] = data.map((s) => ({
            id: s.id,
            date: new Date(s.completed_at).toISOString().split("T")[0],
            energyMode: s.energy_mode as EnergyMode,
            intent: s.intent,
            durationMinutes: s.duration_minutes,
            completedAt: s.completed_at,
          }));
          setSessions(mapped);
        }
        setIsLoading(false);
      } else {
        // Load from localStorage for anonymous users
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            setSessions(JSON.parse(stored));
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      }
    };

    fetchSessions();
  }, [user]);

  const recordSession = useCallback(async (
    energyMode: EnergyMode,
    intent: string | null,
    durationMinutes: number
  ) => {
    const newSession: SessionRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      energyMode,
      intent,
      durationMinutes,
      completedAt: new Date().toISOString(),
    };

    if (user) {
      // Save to Supabase
      const { error } = await supabase.from("sessions").insert({
        id: newSession.id,
        user_id: user.id,
        energy_mode: energyMode,
        intent,
        duration_minutes: durationMinutes,
        completed_at: newSession.completedAt,
      });

      if (!error) {
        setSessions((prev) => [newSession, ...prev].slice(0, 100));
      }
    } else {
      // Save to localStorage for anonymous users
      setSessions((prev) => {
        const updated = [newSession, ...prev].slice(0, 100);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  const getDaySummaries = useCallback((days: number = 7): DaySummary[] => {
    const summaryMap = new Map<string, DaySummary>();
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      summaryMap.set(dateStr, {
        date: dateStr,
        sessionsCount: 0,
        totalMinutes: 0,
      });
    }

    sessions.forEach((session) => {
      const summary = summaryMap.get(session.date);
      if (summary) {
        summary.sessionsCount += 1;
        summary.totalMinutes += session.durationMinutes;
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => 
      b.date.localeCompare(a.date)
    );
  }, [sessions]);

  const getTotalStats = useCallback(() => {
    const daysPresent = new Set(sessions.map((s) => s.date)).size;
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const avgSessionLength = sessions.length > 0 
      ? Math.round(totalMinutes / sessions.length) 
      : 0;

    return {
      daysPresent,
      totalMinutes,
      avgSessionLength,
      totalSessions: sessions.length,
    };
  }, [sessions]);

  return {
    sessions,
    isLoading,
    recordSession,
    getDaySummaries,
    getTotalStats,
  };
};
