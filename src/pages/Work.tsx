import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSessionTimer, EnergyMode, ENERGY_CONFIGS } from "@/hooks/useSessionTimer";
import { usePresenceCount, useWorkingPresence } from "@/hooks/usePresenceCount";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedModes } from "@/hooks/useSavedModes";
import EnergyModeSelector from "@/components/session/EnergyModeSelector";
import PomodoroSettings from "@/components/session/PomodoroSettings";
import SessionTimerDisplay from "@/components/session/SessionTimerDisplay";
import PresenceIndicator from "@/components/session/PresenceIndicator";
import SessionClosure from "@/components/session/SessionClosure";
import OutsideHoursMessage from "@/components/session/OutsideHoursMessage";
import TaskPlanner, { Task } from "@/components/work/TaskPlanner";
import SessionNotes from "@/components/work/SessionNotes";
import LiveFocusChat from "@/components/work/LiveFocusChat";
import UpgradePrompt from "@/components/work/UpgradePrompt";
import WorkingSessionOverlay from "@/components/work/WorkingSessionOverlay";
import GlassOrbs from "@/components/landing/GlassOrbs";
import TimerModeSelector, { TimerMode } from "@/components/session/TimerModeSelector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Settings, Home, Pause, Play, Square, Coffee } from "lucide-react";

type SessionPhase = "setup" | "working" | "closure";

const Work = () => {
  const navigate = useNavigate();
  const presenceCount = usePresenceCount();
  const { startTracking, stopTracking } = useWorkingPresence();
  const { recordSession } = useSessionHistory();
  const { settings, isWithinWorkHours } = useSettings();
  const { profile, user } = useAuth();
  const { getDefaultMode, isLoading: modesLoading } = useSavedModes();

  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [energyMode, setEnergyMode] = useState<EnergyMode>("normal");
  const [timerMode, setTimerMode] = useState<TimerMode>("flexible");
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customBreakMinutes, setCustomBreakMinutes] = useState(5);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [modeApplied, setModeApplied] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const sessionStartRef = useRef<Date | null>(null);

  const isPro = profile?.is_pro ?? false;
  const isGuest = !user;
  const outsideHours = isPro && settings.workHoursEnabled && !isWithinWorkHours();

  // Auto-load default saved mode for Pro users
  useEffect(() => {
    if (isPro && !modesLoading && !modeApplied) {
      const defaultMode = getDefaultMode();
      if (defaultMode) {
        const standardLengths = { low: 15, normal: 30, focused: 45 };
        const matchingMode = Object.entries(standardLengths).find(
          ([_, length]) => length === defaultMode.sessionLength
        );
        
        if (matchingMode) {
          setEnergyMode(matchingMode[0] as EnergyMode);
        } else {
          setEnergyMode("custom");
          setCustomMinutes(defaultMode.sessionLength);
        }
        setModeApplied(true);
      }
    }
  }, [isPro, modesLoading, modeApplied, getDefaultMode]);

  const activeTask = tasks.find(t => t.isActive);

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
        />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
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
    <div className="min-h-screen flex flex-col bg-background">
      <GlassOrbs />

      {/* Minimal floating header */}
      <WorkHeader 
        user={user}
        isPro={isPro}
        presenceCount={presenceCount}
        onBack={phase === "setup" ? () => navigate("/") : handleStop}
        backLabel={phase === "setup" ? "← Home" : "← End"}
        getUserInitials={getUserInitials}
      />

      {/* Main content - Centered "Always On" Design */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 md:px-6 pb-6">
        {outsideHours && phase === "setup" && (
          <OutsideHoursMessage
            workHoursStart={settings.workHoursStart}
            workHoursEnd={settings.workHoursEnd}
          />
        )}

        {!outsideHours && (
          <div className="w-full max-w-5xl mx-auto">
            {/* Working Phase - Ultra minimal, centered timer with overlay */}
            {phase === "working" && (
              <>
                {/* Session overlay for notifications, quotes, tasks/notes display */}
                <WorkingSessionOverlay 
                  tasks={tasks} 
                  notes={notes} 
                  isPro={isPro}
                  onTasksChange={setTasks}
                />
                
                <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
                  {/* Break indicator */}
                  {isOnBreak && (
                    <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <Coffee className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary">Break time</span>
                    </div>
                  )}

                  {/* Active task - subtle context */}
                  {activeTask && !isOnBreak && (
                    <p className="text-sm text-muted-foreground/80 mb-8 max-w-md text-center tracking-wide">
                      {activeTask.text}
                    </p>
                  )}

                  {/* Giant centered timer */}
                  <div className="relative mb-12">
                    <SessionTimerDisplay
                      formattedTime={formattedTime}
                      isRunning={isRunning}
                      progress={progress}
                      timerType={timerType}
                      isOnBreak={isOnBreak}
                    />
                  </div>

                  {/* Minimal controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePauseResume}
                      className="w-14 h-14 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-calm"
                    >
                      {isRunning ? (
                        <Pause className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Play className="w-6 h-6 text-primary" />
                      )}
                    </Button>
                    
                    {/* Take break button - only for pomodoro mode, not during break */}
                    {timerMode === "pomodoro" && !isOnBreak && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleTakeBreak}
                        className="w-12 h-12 rounded-full border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 transition-calm"
                        title="Start break"
                      >
                        <Coffee className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStop}
                      className="w-12 h-12 rounded-full border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-destructive/20 hover:border-destructive/30 transition-calm"
                    >
                      <Square className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Breathing presence indicator */}
                  <div className="mt-16 animate-breathe">
                    <PresenceIndicator count={presenceCount} />
                  </div>
                </div>
              </>
            )}

            {/* Setup Phase - Dashboard-like grid */}
            {phase === "setup" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-fade-up">
                {/* LEFT: Timer & Task Planning */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Session Setup Card - Hero */}
                  <div className="p-8 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/30 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
                      Ready to focus
                    </p>
                    
                    {/* Timer Mode Selector */}
                    <div className="flex justify-center mb-4">
                      <TimerModeSelector
                        selected={timerMode}
                        onSelect={setTimerMode}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground/60 mb-6">
                      {timerMode === "pomodoro" 
                        ? "Work sessions with scheduled breaks" 
                        : "Stopwatch mode — work as long as you want, pause anytime"}
                    </p>
                    
                    {/* Only show settings for Pomodoro mode */}
                    {timerMode === "pomodoro" && (
                      <PomodoroSettings
                        energyMode={energyMode}
                        onEnergyModeChange={setEnergyMode}
                        customWorkMinutes={customMinutes}
                        onCustomWorkMinutesChange={setCustomMinutes}
                        customBreakMinutes={customBreakMinutes}
                        onCustomBreakMinutesChange={setCustomBreakMinutes}
                      />
                    )}
                    
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="mt-8 px-12 py-6 text-base font-medium rounded-full transition-calm hover:scale-[1.02] bg-primary/90 hover:bg-primary"
                    >
                      {timerMode === "flexible" ? "Start Stopwatch" : "Begin Session"}
                    </Button>
                  </div>

                  {/* Task Planner */}
                  <TaskPlanner
                    isPro={isPro}
                    tasks={tasks}
                    onTasksChange={setTasks}
                    onUpgradeClick={handleUpgradeClick}
                  />
                </div>

                {/* RIGHT: Social & Notes */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Live Focus Chat */}
                  <LiveFocusChat
                    isPro={isPro}
                    onUpgradeClick={handleUpgradeClick}
                  />

                  {/* Session Notes */}
                  <SessionNotes
                    isPro={isPro}
                    notes={notes}
                    onNotesChange={setNotes}
                    onUpgradeClick={handleUpgradeClick}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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
}

const WorkHeader = ({ user, isPro, presenceCount, onBack, backLabel, getUserInitials }: WorkHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-calm"
      >
        {backLabel}
      </button>
      
      <div className="flex items-center gap-4">
        <PresenceIndicator count={presenceCount} />
        
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
          onClick={() => navigate("/settings")}
          className="p-2 text-muted-foreground hover:text-foreground transition-calm"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Work;
