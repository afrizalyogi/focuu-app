import { useState, useEffect, useCallback } from "react";

export type EnergyMode = "low" | "normal" | "focused" | "custom";

interface SessionConfig {
  sessionLength: number; // in minutes
  breakLength: number; // in minutes
}

const ENERGY_CONFIGS: Record<Exclude<EnergyMode, "custom">, SessionConfig> = {
  low: { sessionLength: 15, breakLength: 10 },
  normal: { sessionLength: 30, breakLength: 5 },
  focused: { sessionLength: 45, breakLength: 5 },
};

interface UseSessionTimerOptions {
  energyMode: EnergyMode;
  customMinutes?: number;
  onSessionEnd?: () => void;
}

export const useSessionTimer = ({ energyMode, customMinutes = 25, onSessionEnd }: UseSessionTimerOptions) => {
  const getSessionLength = () => {
    if (energyMode === "custom") return customMinutes;
    return ENERGY_CONFIGS[energyMode].sessionLength;
  };

  const getConfig = (): SessionConfig => {
    if (energyMode === "custom") {
      return { sessionLength: customMinutes, breakLength: 5 };
    }
    return ENERGY_CONFIGS[energyMode];
  };

  const sessionLength = getSessionLength();
  const totalSeconds = sessionLength * 60;

  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Reset timer when energy mode or custom minutes changes
  useEffect(() => {
    const newTotal = getSessionLength() * 60;
    setTimeRemaining(newTotal);
    setIsComplete(false);
  }, [energyMode, customMinutes]);

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
    setTimeRemaining(getSessionLength() * 60);
    setIsRunning(false);
    setIsComplete(false);
    setStartTime(null);
  }, [energyMode, customMinutes]);

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
    config: getConfig(),
    start,
    pause,
    resume,
    reset,
    extend,
  };
};

export { ENERGY_CONFIGS };
