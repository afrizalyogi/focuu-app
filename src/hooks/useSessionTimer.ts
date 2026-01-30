import { useState, useEffect, useCallback, useRef } from "react";

export type EnergyMode = "low" | "normal" | "focused" | "custom";
export type TimerType = "countdown" | "stopwatch";

interface SessionConfig {
  sessionLength: number; // in minutes
  breakLength: number; // in minutes
}

const ENERGY_CONFIGS: Record<Exclude<EnergyMode, "custom">, SessionConfig> = {
  low: { sessionLength: 15, breakLength: 5 },
  normal: { sessionLength: 25, breakLength: 5 },
  focused: { sessionLength: 45, breakLength: 10 },
};

interface UseSessionTimerOptions {
  energyMode: EnergyMode;
  timerType: TimerType;
  customMinutes?: number;
  customBreakMinutes?: number;
  onSessionEnd?: () => void;
}

export const useSessionTimer = ({
  energyMode,
  timerType,
  customMinutes = 25,
  customBreakMinutes = 5,
  onSessionEnd,
}: UseSessionTimerOptions) => {
  const STORAGE_KEY = "focuu_session_state";

  const getSessionLength = () => {
    if (energyMode === "custom") return customMinutes;
    return ENERGY_CONFIGS[energyMode].sessionLength;
  };

  const getBreakLength = () => {
    if (energyMode === "custom") return customBreakMinutes;
    return ENERGY_CONFIGS[energyMode].breakLength;
  };

  const getConfig = (): SessionConfig => {
    if (energyMode === "custom") {
      return { sessionLength: customMinutes, breakLength: customBreakMinutes };
    }
    return ENERGY_CONFIGS[energyMode];
  };

  const sessionLength = getSessionLength();
  const totalSeconds = sessionLength * 60;

  // -- LAZY STATE INITIALIZATION --
  // We read from localStorage synchronously during initialization to ensure
  // the hook starts with the correct state immediately.

  const getSavedState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Stale check (2 hours)
      const lastUpdated = new Date(parsed.lastUpdated).getTime();
      const now = new Date().getTime();
      if (now - lastUpdated > 2 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      // Config matching check (simple)
      if (parsed.timerType !== timerType) {
        return null;
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse session state", e);
      return null;
    }
  };

  // 1. Time
  const [time, setTime] = useState(() => {
    const saved = getSavedState();
    if (saved) return saved.time;
    return timerType === "countdown" ? totalSeconds : 0;
  });

  // 2. IsRunning
  const [isRunning, setIsRunning] = useState(() => {
    const saved = getSavedState();
    return saved ? saved.isRunning : false;
  });

  // 3. StartTime
  const [startTime, setStartTime] = useState<Date | null>(() => {
    const saved = getSavedState();
    return saved && saved.startTime ? new Date(saved.startTime) : null;
  });

  // 4. ElapsedSeconds (Ref)
  const elapsedSecondsRef = useRef(() => {
    const saved = getSavedState();
    return saved ? saved.elapsedSeconds : 0;
  });
  // Fix: useRef initializer is only called once, but the return value is the ref object,
  // we need to set .current manually if we want a function to init.
  // Actually React useRef doesn't accept a function initializer like useState.
  // So we function-call it here manually for the initial value.
  const initElapsed = (() => {
    const saved = getSavedState();
    return saved ? saved.elapsedSeconds : 0;
  })();
  // Re-assign ref.current to the calculated init value ONCE (or just use the const)
  // To avoid side-effects in render, we just initialize the ref with the value.
  const persistedElapsedRef = useRef(initElapsed);
  // Renaming to match original variable name used in closure
  const elapsedSecondsRefActual = persistedElapsedRef;

  const [isComplete, setIsComplete] = useState(false);
  const isMountedRef = useRef(false);

  // Track if we restored state to prevent immediate reset
  const restoredStateRef = useRef(!!getSavedState());

  // -- EFFECTS --

  // Reset timer when energy mode, timer type, or custom minutes changes
  useEffect(() => {
    // If this is the FIRST render and we successfully restored state,
    // DO NOT RESET the timer.
    if (!isMountedRef.current && restoredStateRef.current) {
      isMountedRef.current = true;
      return;
    }

    // Normal behavior for subsequent updates OR first render without saved state
    isMountedRef.current = true;

    if (timerType === "countdown") {
      const newTotal = getSessionLength() * 60;
      setTime(newTotal);
    } else {
      setTime(0);
      elapsedSecondsRefActual.current = 0;
    }
    setIsComplete(false);
    // If we are resetting, we should probably clear storage too?
    // Usually yes, changing mode implies new session.
    // However, if the user just refreshed, we want to KEEP the storage (handled by the guard above).
    // If the user *explicitly* changes mode in UI, this effect runs and we want to reset.
    if (isMountedRef.current) {
      // If it's a real change (not mount), we might want to clear storage?
      // Let's rely on the 'Save' effect to update storage with new values (0/false).
    }
  }, [energyMode, timerType, customMinutes, getSessionLength]); // Added getSessionLength dep

  // Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (timerType === "countdown") {
            if (prevTime <= 1) {
              setIsComplete(true);
              setIsRunning(false);
              if (onSessionEnd) onSessionEnd();
              return 0;
            }
            return prevTime - 1;
          } else {
            // Stopwatch
            return prevTime + 1;
          }
        });

        // Update elapsed
        elapsedSecondsRefActual.current += 1;
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isComplete, onSessionEnd, timerType]);

  // Save state to storage on change
  useEffect(() => {
    // Only save if we are running OR if we have significant state (paused but session active)
    // Avoid saving "default" state if it's just a clean slate.

    // Condition: Is Running OR (Time != Default Max AND Time != 0)
    const isDefault =
      !isRunning &&
      (timerType === "countdown" ? time === totalSeconds : time === 0);

    if (!isDefault) {
      const stateToSave = {
        time,
        isRunning,
        startTime,
        timerType,
        elapsedSeconds: elapsedSecondsRefActual.current,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } else {
      // Clear if reset/default
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [time, isRunning, startTime, timerType, totalSeconds]);

  // -- ACTIONS --

  const start = useCallback(() => {
    setIsRunning(true);
    setStartTime((prev) => prev || new Date());
    setIsComplete(false);
    if (timerType === "stopwatch" && time === 0) {
      elapsedSecondsRefActual.current = 0;
    }
  }, [timerType, time]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    if (timerType === "countdown") {
      setTime(getSessionLength() * 60);
    } else {
      setTime(0);
      elapsedSecondsRefActual.current = 0;
    }
    setIsRunning(false);
    setIsComplete(false);
    setStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
    // Reset the restored flag so future logical resets work fine
    restoredStateRef.current = false;
  }, [energyMode, customMinutes, timerType, getSessionLength]);

  const extend = useCallback(
    (minutes: number) => {
      if (timerType === "countdown") {
        setTime((prev) => prev + minutes * 60);
      }
      setIsComplete(false);
      setIsRunning(true);
    },
    [timerType],
  );

  const startBreak = useCallback(() => {
    const breakLength = getBreakLength();
    setTime(breakLength * 60);
    setIsComplete(false);
    setIsRunning(true);
  }, [energyMode, customBreakMinutes, getBreakLength]);

  const startNewSession = useCallback(() => {
    setTime(getSessionLength() * 60);
    setIsComplete(false);
    setIsRunning(true);
    setStartTime(new Date());
  }, [energyMode, customMinutes, getSessionLength]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getElapsedMinutes = useCallback(() => {
    if (timerType === "stopwatch") {
      return Math.ceil(elapsedSecondsRefActual.current / 60);
    } else {
      const used = totalSeconds - time;
      return Math.ceil(used / 60);
    }
  }, [timerType, totalSeconds, time]);

  const progress = timerType === "countdown" ? 1 - time / totalSeconds : 0;

  return {
    time,
    formattedTime: formatTime(time),
    isRunning,
    isComplete,
    progress,
    startTime,
    config: getConfig(),
    timerType,
    getElapsedMinutes,
    start,
    pause,
    resume,
    reset,
    extend,
    startBreak,
    startNewSession,
  };
};

export { ENERGY_CONFIGS };
