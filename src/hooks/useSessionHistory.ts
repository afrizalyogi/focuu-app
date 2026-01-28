import { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "focuu_sessions";

export const useSessionHistory = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const recordSession = useCallback((
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

    setSessions((prev) => {
      const updated = [newSession, ...prev].slice(0, 100); // Keep last 100
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getDaySummaries = useCallback((days: number = 7): DaySummary[] => {
    const summaryMap = new Map<string, DaySummary>();
    
    // Initialize last N days
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

    // Aggregate sessions
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
    recordSession,
    getDaySummaries,
    getTotalStats,
  };
};
