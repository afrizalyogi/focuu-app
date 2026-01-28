import { useState, useEffect, useCallback } from "react";

export type EnergyMode = "low" | "normal" | "focused";

interface SessionConfig {
  sessionLength: number; // in minutes
  breakLength: number; // in minutes
}

const ENERGY_CONFIGS: Record<EnergyMode, SessionConfig> = {
  low: { sessionLength: 15, breakLength: 10 },
  normal: { sessionLength: 30, breakLength: 5 },
  focused: { sessionLength: 45, breakLength: 5 },
};

interface UseSessionTimerOptions {
  energyMode: EnergyMode;
  onSessionEnd?: () => void;
}

export const useSessionTimer = ({ energyMode, onSessionEnd }: UseSessionTimerOptions) => {
  const config = ENERGY_CONFIGS[energyMode];
  const totalSeconds = config.sessionLength * 60;

  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Reset timer when energy mode changes
  useEffect(() => {
    const newTotal = ENERGY_CONFIGS[energyMode].sessionLength * 60;
    setTimeRemaining(newTotal);
    setIsComplete(false);
  }, [energyMode]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          onSessionEnd?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isComplete, onSessionEnd]);

  const start = useCallback(() => {
    setIsRunning(true);
    setStartTime(new Date());
    setIsComplete(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setTimeRemaining(ENERGY_CONFIGS[energyMode].sessionLength * 60);
    setIsRunning(false);
    setIsComplete(false);
    setStartTime(null);
  }, [energyMode]);

  const extend = useCallback((minutes: number) => {
    setTimeRemaining((prev) => prev + minutes * 60);
    setIsComplete(false);
    setIsRunning(true);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progress = 1 - timeRemaining / totalSeconds;

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isRunning,
    isComplete,
    progress,
    startTime,
    config,
    start,
    pause,
    resume,
    reset,
    extend,
  };
};

export { ENERGY_CONFIGS };
