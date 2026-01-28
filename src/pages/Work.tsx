import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSessionTimer, EnergyMode, ENERGY_CONFIGS } from "@/hooks/useSessionTimer";
import { usePresenceCount, useWorkingPresence } from "@/hooks/usePresenceCount";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import EnergyModeSelector from "@/components/session/EnergyModeSelector";
import SessionTimerDisplay from "@/components/session/SessionTimerDisplay";
import PresenceIndicator from "@/components/session/PresenceIndicator";
import SessionClosure from "@/components/session/SessionClosure";
import OutsideHoursMessage from "@/components/session/OutsideHoursMessage";
import TaskPlanner, { Task } from "@/components/work/TaskPlanner";
import SessionNotes from "@/components/work/SessionNotes";
import LiveFocusChat from "@/components/work/LiveFocusChat";
import HistoryMiniView from "@/components/work/HistoryMiniView";
import UpgradePrompt from "@/components/work/UpgradePrompt";

type SessionPhase = "setup" | "working" | "closure";

const Work = () => {
  const navigate = useNavigate();
  const presenceCount = usePresenceCount();
  const { startTracking, stopTracking } = useWorkingPresence();
  const { recordSession } = useSessionHistory();
  const { settings, isWithinWorkHours } = useSettings();
  const { profile, user } = useAuth();

  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [energyMode, setEnergyMode] = useState<EnergyMode>("normal");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const sessionStartRef = useRef<Date | null>(null);

  const isPro = profile?.is_pro ?? false;
  const isGuest = !user;
  const outsideHours = isPro && settings.workHoursEnabled && !isWithinWorkHours();

  // Get active task for session display
  const activeTask = tasks.find(t => t.isActive);

  const handleSessionEnd = useCallback(() => {
    const config = ENERGY_CONFIGS[energyMode];
    recordSession(energyMode, activeTask?.text || null, config.sessionLength);
    stopTracking();
    setPhase("closure");
  }, [energyMode, activeTask, recordSession, stopTracking]);

  const {
    formattedTime,
    isRunning,
    progress,
    start,
    pause,
    resume,
    reset,
    extend,
  } = useSessionTimer({
    energyMode,
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

  const handleStop = () => {
    reset();
    stopTracking();
    setPhase("setup");
    setNotes("");
    sessionStartRef.current = null;
  };

  const handleContinue = () => {
    extend(15);
    setPhase("working");
  };

  const handleBack = () => {
    if (phase === "working" || phase === "closure") {
      handleStop();
    } else {
      navigate("/");
    }
  };

  const handleUpgradeClick = () => {
    setShowUpgradePrompt(true);
  };

  // Closure phase - full screen
  if (phase === "closure") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="flex items-center justify-between p-4 md:p-6">
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            ← Back
          </button>
          <PresenceIndicator count={presenceCount} />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
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
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <button
          onClick={handleBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          {phase === "setup" ? "← Back" : "← End session"}
        </button>
        <PresenceIndicator count={presenceCount} />
      </header>

      {/* Main content - Unified Workspace */}
      <main className="flex-1 px-4 md:px-6 pb-10">
        {/* Outside work hours message for Pro users */}
        {outsideHours && phase === "setup" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <OutsideHoursMessage
              workHoursStart={settings.workHoursStart}
              workHoursEnd={settings.workHoursEnd}
            />
          </div>
        )}

        {!outsideHours && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* LEFT COLUMN - Session Core + Task Planner */}
            <div className="lg:col-span-7 space-y-8">
              {/* AREA 1: SESSION CORE */}
              <div className="flex flex-col items-center gap-8 animate-fade-up">
                {phase === "setup" && (
                  <>
                    <EnergyModeSelector
                      selected={energyMode}
                      onSelect={setEnergyMode}
                    />
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
                    >
                      Start
                    </Button>
                  </>
                )}

                {phase === "working" && (
                  <div className="flex flex-col items-center gap-6 animate-fade-in">
                    {activeTask && (
                      <p className="text-sm text-muted-foreground max-w-sm text-center">
                        {activeTask.text}
                      </p>
                    )}
                    <SessionTimerDisplay
                      formattedTime={formattedTime}
                      isRunning={isRunning}
                      progress={progress}
                    />
                    <Button
                      variant="ghost"
                      onClick={handlePauseResume}
                      className="text-muted-foreground hover:text-foreground transition-calm"
                    >
                      {isRunning ? "Pause" : "Resume"}
                    </Button>
                  </div>
                )}
              </div>

              {/* AREA 2: TASK PLANNER */}
              <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
                <TaskPlanner
                  isPro={isPro}
                  tasks={tasks}
                  onTasksChange={setTasks}
                  onUpgradeClick={handleUpgradeClick}
                />
              </div>

              {/* AREA 3: SESSION NOTES */}
              <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
                <SessionNotes
                  isPro={isPro}
                  notes={notes}
                  onNotesChange={setNotes}
                  onUpgradeClick={handleUpgradeClick}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Chat + History */}
            <div className="lg:col-span-5 space-y-6">
              {/* AREA 4: LIVE FOCUS CHAT */}
              <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
                <LiveFocusChat
                  isPro={isPro}
                  onUpgradeClick={handleUpgradeClick}
                />
              </div>

              {/* AREA 5: HISTORY MINI VIEW */}
              <div className="animate-fade-up" style={{ animationDelay: "250ms" }}>
                <HistoryMiniView
                  isPro={isPro}
                  onUpgradeClick={handleUpgradeClick}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Prompt Dialog */}
      <UpgradePrompt 
        open={showUpgradePrompt} 
        onOpenChange={setShowUpgradePrompt} 
      />
    </div>
  );
};

export default Work;
