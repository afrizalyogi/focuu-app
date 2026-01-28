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
  onSessionEnd 
}: UseSessionTimerOptions) => {
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

  // For countdown: time remaining (counts down)
  // For stopwatch: elapsed time (counts up)
  const [time, setTime] = useState(timerType === "countdown" ? totalSeconds : 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const elapsedSecondsRef = useRef(0);

  // Reset timer when energy mode, timer type, or custom minutes changes
  useEffect(() => {
    if (timerType === "countdown") {
      const newTotal = getSessionLength() * 60;
      setTime(newTotal);
    } else {
      setTime(0);
      elapsedSecondsRef.current = 0;
    }
    setIsComplete(false);
  }, [energyMode, timerType, customMinutes]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      if (timerType === "countdown") {
        // Countdown mode
        setTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            onSessionEnd?.();
            return 0;
          }
          return prev - 1;
        });
      } else {
        // Stopwatch mode - count up
        setTime((prev) => {
          elapsedSecondsRef.current = prev + 1;
          return prev + 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isComplete, onSessionEnd, timerType]);

  const start = useCallback(() => {
    setIsRunning(true);
    setStartTime(new Date());
    setIsComplete(false);
    if (timerType === "stopwatch") {
      setTime(0);
      elapsedSecondsRef.current = 0;
    }
  }, [timerType]);

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
      elapsedSecondsRef.current = 0;
    }
    setIsRunning(false);
    setIsComplete(false);
    setStartTime(null);
  }, [energyMode, customMinutes, timerType]);

  const extend = useCallback((minutes: number) => {
    if (timerType === "countdown") {
      setTime((prev) => prev + minutes * 60);
    }
    setIsComplete(false);
    setIsRunning(true);
  }, [timerType]);

  // For countdown timer - start a break
  const startBreak = useCallback(() => {
    const breakLength = getBreakLength();
    setTime(breakLength * 60);
    setIsComplete(false);
    setIsRunning(true);
  }, [energyMode, customBreakMinutes]);

  // For countdown timer - start a new work session
  const startNewSession = useCallback(() => {
    setTime(getSessionLength() * 60);
    setIsComplete(false);
    setIsRunning(true);
    setStartTime(new Date());
  }, [energyMode, customMinutes]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Get elapsed time in minutes (for recording sessions)
  const getElapsedMinutes = useCallback(() => {
    if (timerType === "stopwatch") {
      return Math.ceil(elapsedSecondsRef.current / 60);
    } else {
      // For countdown, calculate how much time was used
      const used = totalSeconds - time;
      return Math.ceil(used / 60);
    }
  }, [timerType, totalSeconds, time]);

  // Progress for countdown mode
  const progress = timerType === "countdown" 
    ? 1 - time / totalSeconds 
    : 0; // Stopwatch doesn't have progress

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