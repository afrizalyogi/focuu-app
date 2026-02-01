/* eslint-disable @typescript-eslint/no-explicit-any */
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
import WorkTutorial from "@/components/work/WorkTutorial";
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
import BackButton from "@/components/common/BackButton";
import { getOnboardingData } from "./Onboarding";
import { useLiveChat } from "@/hooks/useLiveChat";
import ChatNotificationBubble from "@/components/work/ChatNotificationBubble";
import DocumentPiPButton from "@/components/work/DocumentPiPButton";
import SessionRatingDialog from "@/components/work/SessionRatingDialog";
import { supabase } from "@/integrations/supabase/client";

type SessionPhase = "setup" | "working" | "closure";

// Extracted header component for cleaner code
interface WorkHeaderProps {
  user: any;
  profile: any;
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
    <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between px-4 py-4 md:py-6">
      <BackButton onClick={onBack} label={backLabel.replace("← ", "")} />

      {/* Center PresenceDisplay during work mode */}
      {isWorking && (
        <div className="hidden md:absolute md:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <PresenceDisplay count={presenceCount} />
        </div>
      )}

      <div className="flex items-center gap-4">
        {!isWorking && (
          <>
            <div className="hidden md:absolute md:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PresenceDisplay count={presenceCount} />
            </div>
            {user && (
              <button
                onClick={() => navigate("/app")}
                className="flex items-center gap-2 group"
              >
                <Avatar className="h-8 w-8 border-2 border-primary/20 group-hover:border-primary/50 transition-calm">
                  {user?.user_metadata?.avatar_url ||
                  (user as any)?.avatar_url ? (
                    <img
                      src={
                        user?.user_metadata?.avatar_url ||
                        (user as any)?.avatar_url
                      }
                      alt="User"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
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

const Work = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Debug log to ensure fresh render
  console.log("Rendering Work Page");
  const presenceCount = usePresenceCount();
  const { startTracking, stopTracking } = useWorkingPresence();
  const { recordSession, getTotalStats, sessions, upsertSession } =
    useSessionHistory();
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
  const [showTutorial, setShowTutorial] = useState(false);
  const sessionStartRef = useRef<Date | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatNotificationsEnabled, setIsChatNotificationsEnabled] =
    useState(true);

  // Global Chat State
  const [activeDockSheet, setActiveDockSheet] = useState<string | null>(null);
  const {
    messages: chatMessages,
    sendMessage: sendChatMessage,
    isLoading: isChatLoading,
    latestMessage: latestChatMessage,
    clearNotification: clearChatNotification,
  } = useLiveChat(true); // Always enabled, but access controlled by Pro flag in UI

  // Clear notifications when chat is opened
  useEffect(() => {
    if (activeDockSheet === "chat") {
      clearChatNotification();
    }
  }, [activeDockSheet, clearChatNotification]);

  // Use trial access for Pro features
  const isPro = hasProAccess;
  const isGuest = !user;
  const outsideHours =
    isPro && settings.workHoursEnabled && !isWithinWorkHours();

  // Check tutorial status
  useEffect(() => {
    // If guest, use localStorage
    if (!user) {
      const hasSeenTutorial = localStorage.getItem("focuu_work_tutorial_seen");
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
      return;
    }

    // If logged in, check DB directly to avoid stale state
    const checkTutorialStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_tutorial_seen")
          .eq("id", user.id)
          .single();

        // Only show if explicitly false
        if (data && data.is_tutorial_seen === false) {
          setShowTutorial(true);
        }
      }
    };

    checkTutorialStatus();
  }, [user]);

  const [showRating, setShowRating] = useState(false);

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    localStorage.setItem("focuu_work_tutorial_seen", "true");

    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({ is_tutorial_seen: true } as any)
          .eq("id", user.id);
      } catch (e) {
        console.error("Failed to update tutorial status", e);
      }
    }
  };

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
  }, [location.state, onboardingApplied]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore phase based on timer state
  useEffect(() => {
    const savedState = localStorage.getItem("focuu_session_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
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
  }, []);

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
          priority: "high",
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
    setPhase("working");
  };

  const handleStop = async () => {
    // Only save if we actually worked > 10 seconds?
    const elapsedSeconds = getElapsedMinutes() * 60; // Calculate elapsed seconds
    if (elapsedSeconds > 10) {
      // Final save
      const durationMinutes = Math.floor(getElapsedMinutes()); // Use getElapsedMinutes()

      if (sessionId && upsertSession) {
        await upsertSession({
          id: sessionId,
          date: new Date().toISOString().split("T")[0],
          energyMode,
          intent: activeTask?.text || null,
          durationMinutes: Math.floor(getElapsedMinutes()),
          completedAt: new Date().toISOString(),
        });
      }

      recordSession(
        energyMode,
        activeTask?.text || null,
        Math.floor(getElapsedMinutes()),
        timerMode,
      );
      trackSessionEnd({
        energyMode,
        timerMode,
        durationMinutes: durationMinutes,
      });

      // Show rating if session was meaningful
      if (durationMinutes >= 15 || (isPro && durationMinutes >= 1)) {
        setShowRating(true);
      }
    }

    setNotes("");
    setIsOnBreak(false);
    sessionStartRef.current = null;
    setSessionId(null); // Clear ID
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
          profile={profile}
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
        "relative min-h-[100dvh] w-full flex flex-col transition-colors duration-500 overflow-hidden",
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
        profile={profile}
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
                  <div
                    id="work-timer-mode"
                    className="flex justify-center mb-6"
                  >
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
                      className="w-full bg-transparent border-b-2 border-border/50 text-center text-lg md:text-2xl font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all py-2"
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
                                priority: "high",
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
                    id="work-start-button"
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
                  <div className="flex items-center gap-4 md:gap-6 mt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePauseResume}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 transition-all"
                    >
                      {isRunning ? (
                        <Pause className="w-6 h-6 md:w-8 md:h-8 text-foreground" />
                      ) : (
                        <Play className="w-6 h-6 md:w-8 md:h-8 text-primary ml-1" />
                      )}
                    </Button>

                    {timerMode === "pomodoro" && !isOnBreak && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleTakeBreak}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-border/30 bg-card/20 hover:bg-card/40 text-muted-foreground hover:text-foreground"
                        title="Take a break"
                      >
                        <Coffee className="w-5 h-5 md:w-6 md:h-6" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStop}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-border/30 bg-card/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
                    >
                      <Square className="w-5 h-5 md:w-6 md:h-6" />
                    </Button>

                    <DocumentPiPButton
                      formattedTime={formattedTime}
                      isRunning={isRunning}
                      progress={progress}
                      timerType={timerType}
                      isOnBreak={isOnBreak}
                      activeTaskText={activeTask?.text}
                      onTogglePause={handlePauseResume}
                      onStop={handleStop}
                    />

                    <FullscreenButton />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Hidden Music Player */}
      <MusicPlayer url={preferences.musicUrl} />

      {/* Environment Dock - Always visible (except closure) */}
      <EnvironmentDock
        preferences={preferences}
        setTheme={setTheme}
        setMusicUrl={setMusicUrl}
        setBackgroundUrl={setBackgroundUrl}
        isPro={isPro}
        onUpgradeClick={handleUpgradeClick}
        tasks={tasks}
        onAddTask={(text) => {
          const newTask: Task = {
            id: crypto.randomUUID(),
            text,
            category: "light",
            priority: "medium",
            isActive: tasks.length === 0, // Auto-active if first
          };
          setTasks([...tasks, newTask]);
        }}
        onToggleTask={(id) => {
          const maxActive = isPro ? 3 : 1;
          const currentActive = tasks.filter((t) => t.isActive).length;
          const task = tasks.find((t) => t.id === id);
          if (!task) return;

          if (task.isActive) {
            setTasks(
              tasks.map((t) => (t.id === id ? { ...t, isActive: false } : t)),
            );
          } else if (currentActive < maxActive) {
            setTasks(
              tasks.map((t) => (t.id === id ? { ...t, isActive: true } : t)),
            );
          }
        }}
        onRemoveTask={(id) => setTasks(tasks.filter((t) => t.id !== id))}
        activeSheet={activeDockSheet}
        onOpenChange={setActiveDockSheet}
        chatMessages={chatMessages}
        onSendMessage={sendChatMessage}
        isChatLoading={isChatLoading}
        isChatNotificationsEnabled={isChatNotificationsEnabled}
        onToggleChatNotifications={setIsChatNotificationsEnabled}
      />

      {/* Chat Notification Bubble */}
      {activeDockSheet !== "chat" && isChatNotificationsEnabled && (
        <ChatNotificationBubble
          key={latestChatMessage?.id}
          message={latestChatMessage}
          onClear={clearChatNotification}
          onOpenChat={() => setActiveDockSheet("chat")}
        />
      )}

      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
      />

      {showTutorial && <WorkTutorial onComplete={handleTutorialComplete} />}

      <SessionRatingDialog
        open={showRating}
        onOpenChange={setShowRating}
        onComplete={() => setShowRating(false)}
      />
    </div>
  );
};

export default Work;
