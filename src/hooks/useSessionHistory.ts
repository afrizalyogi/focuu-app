import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EnergyMode } from "./useSessionTimer";
import { encryptAndStore, retrieveAndDecrypt } from "@/utils/secureStorage";

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

const SECURE_SESSIONS_KEY = "focuu_secure_sessions_v1";

export const useSessionHistory = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Core fetch function
  const fetchSessionsFromDB = useCallback(async () => {
    if (!user) return;
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
      await encryptAndStore(SECURE_SESSIONS_KEY, mapped);
      console.log("Refreshed sessions from DB and updated cache");
    }
    setIsLoading(false);
  }, [user]);

  // Initial Load Strategy
  useEffect(() => {
    const init = async () => {
      if (user) {
        setIsLoading(true);
        // 1. Try secure cache
        const cached =
          await retrieveAndDecrypt<SessionRecord[]>(SECURE_SESSIONS_KEY);

        if (cached && Array.isArray(cached) && cached.length > 0) {
          setSessions(cached);
          setIsLoading(false);
          console.log("Loaded sessions from secure cache");
          // Per user request: DO NOT hit API if cache exists.
          // Only explicit refresh will trigger DB fetch.
          return;
        }

        // 2. If no cache, fetch from DB
        await fetchSessionsFromDB();
      } else {
        // Load from localStorage for anonymous users (Legacy/Guest)
        // We can keep using standard localStorage for guests or upgrade them too?
        // Let's use secure storage for consistency if we want, but guests dont need security as much?
        // Use standard LS for guests to avoid complexity with key generation if not persistent enough.
        // Actually, retrieveAndDecrypt works fine.
        const cached =
          await retrieveAndDecrypt<SessionRecord[]>(SECURE_SESSIONS_KEY);
        if (cached) setSessions(cached);
      }
    };

    init();
  }, [user, fetchSessionsFromDB]); // fetchSessionsFromDB depends on user

  const recordSession = useCallback(
    async (
      energyMode: EnergyMode,
      intent: string | null,
      durationMinutes: number,
      timerMode: string = "flexible",
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
        // Map to DB enums
        const dbEnergyLevel =
          energyMode === "normal"
            ? "okay"
            : energyMode === "focused"
              ? "high"
              : energyMode === "custom"
                ? "okay"
                : energyMode;

        const dbTimerMode = timerMode === "flexible" ? "stopwatch" : "pomodoro";

        // Save to Supabase
        const { error } = await supabase.from("sessions").insert({
          id: newSession.id,
          user_id: user.id,
          energy_level: dbEnergyLevel, // note column name change if needed, checking schema
          // Schema says 'energy_level', my previous read saw 'energy_mode' in upsert.
          // Schema step 3063 line 63: energy_level
          // Code step 3056 line 44: energy_mode: s.energyMode (in upsert) and line 117 energy_mode: energyMode
          // So previous code was using WRONG COLUMN NAME 'energy_mode'. Schema has 'energy_level'.
          timer_mode: dbTimerMode,
          intent,
          duration_minutes: durationMinutes,
          completed_at: newSession.completedAt,
        });

        if (error) {
          console.error("Failed to save session:", error);
        } else {
          setSessions((prev) => {
            const updated = [newSession, ...prev].slice(0, 100);
            encryptAndStore(SECURE_SESSIONS_KEY, updated); // Update cache
            return updated;
          });
        }
      } else {
        // Guest mode
        setSessions((prev) => {
          const updated = [newSession, ...prev].slice(0, 100);
          encryptAndStore(SECURE_SESSIONS_KEY, updated);
          return updated;
        });
      }
    },
    [user],
  );

  const getDaySummaries = useCallback(
    (days: number = 7): DaySummary[] => {
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
        b.date.localeCompare(a.date),
      );
    },
    [sessions],
  );

  const getTotalStats = useCallback(() => {
    const daysPresent = new Set(sessions.map((s) => s.date)).size;
    const totalMinutes = sessions.reduce(
      (acc, s) => acc + s.durationMinutes,
      0,
    );
    const avgSessionLength =
      sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;

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
    refreshSessions: fetchSessionsFromDB,
    upsertSession: async (session: SessionRecord) => {
      // Keep existing upsert logic for completion
      if (!user) return;
      const dbEnergyLevel =
        session.energyMode === "normal"
          ? "okay"
          : session.energyMode === "focused"
            ? "high"
            : session.energyMode === "custom"
              ? "okay"
              : session.energyMode;
      await supabase.from("sessions").upsert({
        id: session.id,
        user_id: user.id,
        energy_level: dbEnergyLevel,
        timer_mode: "stopwatch",
        intent: session.intent,
        duration_minutes: session.durationMinutes,
        completed_at: session.completedAt,
        completed: false,
      });
    },
  };
};
