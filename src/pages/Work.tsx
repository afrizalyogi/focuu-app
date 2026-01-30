import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  useSessionTimer,
  EnergyMode,
  ENERGY_CONFIGS,
} from "@/hooks/useSessionTimer";
import { usePresenceCount, useWorkingPresence } from "@/hooks/usePresenceCount";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/hooks/useStreak";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTrial } from "@/hooks/useTrial";
import EnergyModeSelector from "@/components/session/EnergyModeSelector";
import PomodoroSettings from "@/components/session/PomodoroSettings";
import SessionTimerDisplay from "@/components/session/SessionTimerDisplay";
import PresenceIndicator from "@/components/session/PresenceIndicator";
import PresenceDisplay from "@/components/landing/PresenceDisplay";
import SessionClosure from "@/components/session/SessionClosure";
import OutsideHoursMessage from "@/components/session/OutsideHoursMessage";
import TaskPlanner, { Task } from "@/components/work/TaskPlanner";
import SessionNotes from "@/components/work/SessionNotes";
import LiveFocusChat from "@/components/work/LiveFocusChat";
import UpgradePrompt from "@/components/work/UpgradePrompt";
import WorkingSessionOverlay from "@/components/work/WorkingSessionOverlay";
import GlassOrbs from "@/components/landing/GlassOrbs";
import TimerModeSelector, {
  TimerMode,
} from "@/components/session/TimerModeSelector";
import StreakDisplay from "@/components/work/StreakDisplay";
import ThemePicker from "@/components/work/ThemePicker";
import MusicInput from "@/components/work/MusicInput";
import MusicPlayer from "@/components/work/MusicPlayer";
import BackgroundInput from "@/components/work/BackgroundInput";
import CustomBackground from "@/components/work/CustomBackground";
import FullscreenButton from "@/components/work/FullscreenButton";
import EnvironmentDock from "@/components/work/EnvironmentDock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Crown,
  Settings,
  Home,
  Pause,
  Play,
  Square,
  Coffee,
  Maximize,
} from "lucide-react";
import { getOnboardingData } from "./Onboarding";

type SessionPhase = "setup" | "working" | "closure";

const Work = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Debug log to ensure fresh render
  console.log("Rendering Work Page");
  const presenceCount = usePresenceCount();
  const { startTracking, stopTracking } = useWorkingPresence();
  const { recordSession, getTotalStats, sessions } = useSessionHistory();
  const { settings, isWithinWorkHours } = useSettings();
  const { profile, user } = useAuth();
  const { streak: currentStreak } = useStreak();

  const isStreakActiveToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return sessions?.some((s) => s.date === today) ?? false;
  };

  const isStreakAtRisk = () => {
    return !isStreakActiveToday();
  };
  const { preferences, setMusicUrl, setBackgroundUrl, setTheme } =
    useUserPreferences();
  const { track, trackSessionStart, trackSessionEnd } = useAnalytics();
  const { hasProAccess, isTrial } = useTrial();

  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [energyMode, setEnergyMode] = useState<EnergyMode>("normal");
  const [timerMode, setTimerMode] = useState<TimerMode>("flexible");
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customBreakMinutes, setCustomBreakMinutes] = useState(5);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [onboardingApplied, setOnboardingApplied] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const sessionStartRef = useRef<Date | null>(null);

  // Use trial access for Pro features
  const isPro = hasProAccess;
  const isGuest = !user;
  const outsideHours =
    isPro && settings.workHoursEnabled && !isWithinWorkHours();

  // Apply onboarding data when coming from onboarding
  useEffect(() => {
    if (onboardingApplied) return;

    // Check location state first (coming directly from onboarding)
    const locationState = location.state as any;
    if (locationState?.fromOnboarding) {
      applyOnboardingSettings(locationState);
      setOnboardingData(locationState);
      setOnboardingApplied(true);
      return;
    }

    // Fallback: Check localStorage if not coming directly
    const storedOnboarding = getOnboardingData();
    if (storedOnboarding) {
      applyOnboardingSettings(storedOnboarding);
      setOnboardingData(storedOnboarding);
      setOnboardingApplied(true);
      return;
    }

    // Behavioral Personalization: Use average session length
    const stats = getTotalStats();
    if (stats.avgSessionLength > 0) {
      // Round to nearest 5 minutes
      const suggested = Math.round(stats.avgSessionLength / 5) * 5;
      if (suggested >= 5 && suggested <= 120) {
        setCustomMinutes(suggested);
      }
    }
    setOnboardingApplied(true);
  }, [location.state, onboardingApplied]);

  // Restore phase based on timer state
  useEffect(() => {
    // If timer is running or has time > 0 (and not default max), implies active session
    // We check saved state directly or infer from hook state if already loaded
    // Note: useSessionTimer loads from storage on mount.
    // We need to wait for it to load? actually useSessionTimer state is initialized lazily in its own useEffect
    // But here, we can just check if time != default or isRunning is true
    const savedState = localStorage.getItem("focuu_session_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // If persisted state says running or previously worked
        if (
          parsed.isRunning ||
          (parsed.time > 0 && parsed.timerType === "stopwatch") ||
          (parsed.time < parsed.totalSeconds &&
            parsed.timerType === "countdown")
        ) {
          setPhase("working");
          if (parsed.startTime)
            sessionStartRef.current = new Date(parsed.startTime);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []); // Run once on mount

  const applyOnboardingSettings = (data: any) => {
    // Map session length to energy mode
    const lengthToMode: Record<number, EnergyMode> = {
      15: "low",
      30: "normal",
      45: "focused",
    };

    if (data.sessionLength && lengthToMode[data.sessionLength]) {
      setEnergyMode(lengthToMode[data.sessionLength]);
    }

    // Add initial task if provided
    if (data.initialTask) {
      setTasks([
        {
          id: Date.now().toString(),
          text: data.initialTask,
          category: "deep" as const,
          isActive: true,
        },
      ]);
    }
  };

  const activeTask = tasks.find((t) => t.isActive);

  const handleSessionEnd = useCallback(() => {
    // For pomodoro mode, suggest a break
    if (timerMode === "pomodoro") {
      setIsOnBreak(true);
    }

    stopTracking();
    setPhase("closure");
  }, [stopTracking, timerMode]);

  const {
    formattedTime,
    isRunning,
    progress,
    timerType,
    getElapsedMinutes,
    start,
    pause,
    resume,
    reset,
    extend,
    startBreak,
    startNewSession,
  } = useSessionTimer({
    energyMode,
    timerType: timerMode === "pomodoro" ? "countdown" : "stopwatch",
    customMinutes,
    customBreakMinutes,
    onSessionEnd: handleSessionEnd,
  });

  const handleStart = () => {
    start();
    startTracking();
    sessionStartRef.current = new Date();
    setPhase("working");

    // Track session start with feature usage data
    trackSessionStart({
      energyMode,
      timerMode,
      features: {
        theme: preferences.theme,
        hasMusic: !!preferences.musicUrl,
        musicTitle: preferences.musicTitle || "None",
        bgType: preferences.backgroundType,
        hasCustomBg: preferences.backgroundType !== "none",
      },
    });
  };

  const handlePauseResume = () => {
    if (isRunning) {
      pause();
    } else {
      resume();
    }
  };

  // Record session and stop - works for both timer types
  const handleStop = () => {
    // Always record the session with actual time worked
    const elapsedMinutes = getElapsedMinutes();
    if (elapsedMinutes > 0) {
      recordSession(energyMode, activeTask?.text || null, elapsedMinutes);
      trackSessionEnd({
        energyMode,
        timerMode,
        durationMinutes: elapsedMinutes,
      });
    }

    reset();
    stopTracking();
    setPhase("setup");
    setNotes("");
    setIsOnBreak(false);
    sessionStartRef.current = null;
  };

  const handleContinue = () => {
    if (timerMode === "pomodoro") {
      startNewSession();
    } else {
      // For flexible, just continue the stopwatch
      resume();
    }
    setIsOnBreak(false);
    setPhase("working");
  };

  const handleTakeBreak = () => {
    if (timerMode === "pomodoro") {
      startBreak();
    }
    setIsOnBreak(true);
  };

  const handleUpgradeClick = () => {
    setShowUpgradePrompt(true);
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "?";
  };

  // Closure phase - full screen centered
  if (phase === "closure") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GlassOrbs />
        <WorkHeader
          user={user}
          isPro={isPro}
          presenceCount={presenceCount}
          onBack={handleStop}
          backLabel="← Back"
          getUserInitials={getUserInitials}
          isWorking={false}
        />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-20 px-6 pb-20">
          <SessionClosure
            onStop={handleStop}
            onContinue={handleContinue}
            isPro={isPro}
            onUpgradeClick={handleUpgradeClick}
          />
        </main>
        <UpgradePrompt
          open={showUpgradePrompt}
          onOpenChange={setShowUpgradePrompt}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-colors duration-500",
        !preferences.backgroundUrl || preferences.backgroundType === "none"
          ? "bg-background"
          : "bg-transparent",
      )}
    >
      {/* Custom background - fixed behind everything */}
      {isPro &&
        preferences.backgroundUrl &&
        preferences.backgroundType !== "none" && (
          <CustomBackground
            imageUrl={
              preferences.backgroundType === "image"
                ? preferences.backgroundUrl
                : undefined
            }
            videoUrl={
              preferences.backgroundType === "video"
                ? preferences.backgroundUrl
                : undefined
            }
          />
        )}

      <GlassOrbs />

      {/* Minimal floating header */}
      <WorkHeader
        user={user}
        isPro={isPro}
        presenceCount={presenceCount}
        onBack={phase === "setup" ? () => navigate("/app") : handleStop}
        backLabel={phase === "setup" ? "← Back" : "← End"}
        getUserInitials={getUserInitials}
        isWorking={phase === "working"}
      />

      {/* Main content - Centered "Always On" Design */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 md:px-6 pb-24">
        {outsideHours && phase === "setup" && (
          <OutsideHoursMessage
            workHoursStart={settings.workHoursStart}
            workHoursEnd={settings.workHoursEnd}
          />
        )}

        {!outsideHours && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            {/* SETUP PHASE: HERO CARD */}
            {phase === "setup" && (
              <div className="w-full max-w-2xl animate-fade-up space-y-8">
                {/* Hero Card */}
                <div className="p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl text-center relative overflow-hidden">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />

                  {/* Streak Badge (Top Center) */}
                  {currentStreak > 0 && (
                    <div className="flex justify-center mb-8">
                      <StreakDisplay
                        currentStreak={currentStreak}
                        longestStreak={currentStreak}
                        isActiveToday={isStreakActiveToday()}
                        isAtRisk={isStreakAtRisk()}
                        size="lg"
                      />
                    </div>
                  )}

                  {/* Timer Mode Selection */}
                  <div className="flex justify-center mb-6">
                    <TimerModeSelector
                      selected={timerMode}
                      onSelect={setTimerMode}
                    />
                  </div>

                  {/* Task Input (Simplified TaskPlanner) */}
                  <div className="mb-8 max-w-md mx-auto">
                    <input
                      type="text"
                      placeholder="What's your main focus?"
                      className="w-full bg-transparent border-b-2 border-border/50 text-center text-xl md:text-2xl font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all py-2"
                      value={tasks[0]?.text || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTasks((prev) => {
                          const newTasks = [...prev];
                          if (newTasks.length === 0) {
                            return [
                              {
                                id: Date.now().toString(),
                                text: val,
                                category: "deep",
                                isActive: true,
                              },
                            ];
                          }
                          newTasks[0] = {
                            ...newTasks[0],
                            text: val,
                            isActive: true,
                          };
                          return newTasks;
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleStart();
                      }}
                    />
                  </div>

                  {/* Start Button */}
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="px-16 py-8 text-xl font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all bg-primary text-primary-foreground"
                  >
                    {timerMode === "flexible" ? "Start Focus" : "Start Session"}
                  </Button>

                  {/* Pomodoro Settings (Collapsible or subtle) */}
                  {timerMode === "pomodoro" && (
                    <div className="mt-8">
                      <PomodoroSettings
                        energyMode={energyMode}
                        onEnergyModeChange={setEnergyMode}
                        customWorkMinutes={customMinutes}
                        onCustomWorkMinutesChange={setCustomMinutes}
                        customBreakMinutes={customBreakMinutes}
                        onCustomBreakMinutesChange={setCustomBreakMinutes}
                      />
                    </div>
                  )}
                </div>

                {/* Onboarding Tip / Greeting */}
                {onboardingData?.toneMode && (
                  <div className="text-center animate-fade-in">
                    <p className="text-sm text-muted-foreground bg-card/50 inline-block px-4 py-1.5 rounded-full border border-border/40">
                      {onboardingData.toneMode === "brutal" &&
                        "🔥 Mode: Brutal. No excuses."}
                      {onboardingData.toneMode === "medium" &&
                        "🧘 Mode: Balanced. Stay steady."}
                      {onboardingData.toneMode === "affirmative" &&
                        "✨ Mode: Supportive. You got this."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* WORKING PHASE: IMMERSIVE */}
            {phase === "working" && (
              <>
                <WorkingSessionOverlay
                  tasks={tasks}
                  notes={notes}
                  isPro={isPro}
                  onTasksChange={setTasks}
                />

                <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in z-20">
                  {/* Break Status */}
                  {isOnBreak && (
                    <div className="flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                      <Coffee className="w-5 h-5 text-primary" />
                      <span className="text-primary font-medium">
                        Break time
                      </span>
                    </div>
                  )}

                  {/* Active Task Display */}
                  {activeTask && !isOnBreak && (
                    <div className="mb-8 text-center animate-fade-up">
                      <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
                        Current Focus
                      </p>
                      <h2 className="text-2xl md:text-3xl font-semibold leading-tight max-w-2xl">
                        {activeTask.text}
                      </h2>
                    </div>
                  )}

                  {/* Main Timer */}
                  <div className="relative mb-12 transform scale-125 md:scale-150">
                    <SessionTimerDisplay
                      formattedTime={formattedTime}
                      isRunning={isRunning}
                      progress={progress}
                      timerType={timerType}
                      isOnBreak={isOnBreak}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePauseResume}
                      className="w-16 h-16 rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 transition-all"
                    >
                      {isRunning ? (
                        <Pause className="w-8 h-8 text-foreground" />
                      ) : (
                        <Play className="w-8 h-8 text-primary ml-1" />
                      )}
                    </Button>

                    {timerMode === "pomodoro" && !isOnBreak && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleTakeBreak}
                        className="w-14 h-14 rounded-full border border-border/30 bg-card/20 hover:bg-card/40 text-muted-foreground hover:text-foreground"
                        title="Take a break"
                      >
                        <Coffee className="w-6 h-6" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStop}
                      className="w-14 h-14 rounded-full border border-border/30 bg-card/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
                    >
                      <Square className="w-6 h-6" />
                    </Button>

                    <FullscreenButton size="sm" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Environment Dock - Always visible (except closure) */}
      <EnvironmentDock
        preferences={preferences}
        setTheme={setTheme}
        setMusicUrl={setMusicUrl}
        setBackgroundUrl={setBackgroundUrl}
        isPro={isPro}
        onUpgradeClick={handleUpgradeClick}
      />

      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
      />
    </div>
  );
};

// Extracted header component for cleaner code
interface WorkHeaderProps {
  user: any;
  isPro: boolean;
  presenceCount: number;
  onBack: () => void;
  backLabel: string;
  getUserInitials: () => string;
  isWorking: boolean;
}

const WorkHeader = ({
  user,
  isPro,
  presenceCount,
  onBack,
  backLabel,
  getUserInitials,
  isWorking,
}: WorkHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-calm"
      >
        {backLabel}
      </button>

      {/* Center PresenceDisplay during work mode */}
      {isWorking && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <PresenceIndicator count={presenceCount} />
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Only show small indicator if NOT working */}
        {!isWorking && <PresenceIndicator count={presenceCount} />}

        {!isWorking && (
          <>
            {user && (
              <button
                onClick={() => navigate("/app")}
                className="flex items-center gap-2 group"
              >
                <Avatar className="h-8 w-8 border-2 border-primary/20 group-hover:border-primary/50 transition-calm">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {isPro && <Crown className="w-4 h-4 text-primary" />}
              </button>
            )}

            <button
              onClick={() => navigate("/app/settings")}
              className="p-2 text-muted-foreground hover:text-foreground transition-calm"
            >
              <Settings className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Work;
