import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSessionTimer, EnergyMode } from "@/hooks/useSessionTimer";
import { usePresenceCount } from "@/hooks/usePresenceCount";
import EnergyModeSelector from "@/components/session/EnergyModeSelector";
import SessionTimerDisplay from "@/components/session/SessionTimerDisplay";
import PresenceIndicator from "@/components/session/PresenceIndicator";
import IntentLine from "@/components/session/IntentLine";
import SessionClosure from "@/components/session/SessionClosure";

type SessionPhase = "setup" | "working" | "closure";

const Work = () => {
  const navigate = useNavigate();
  const presenceCount = usePresenceCount();

  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [energyMode, setEnergyMode] = useState<EnergyMode>("normal");
  const [intent, setIntent] = useState("");

  const handleSessionEnd = useCallback(() => {
    setPhase("closure");
  }, []);

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
    setPhase("setup");
    setIntent("");
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

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {phase === "setup" && (
          <div className="flex flex-col items-center gap-10 animate-fade-up">
            {/* Energy mode selector */}
            <EnergyModeSelector
              selected={energyMode}
              onSelect={setEnergyMode}
            />

            {/* Intent line */}
            <IntentLine
              value={intent}
              onChange={setIntent}
            />

            {/* Start button */}
            <Button
              onClick={handleStart}
              size="lg"
              className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
            >
              Start
            </Button>
          </div>
        )}

        {phase === "working" && (
          <div className="flex flex-col items-center gap-10 animate-fade-in">
            {/* Intent display */}
            {intent && (
              <p className="text-sm text-muted-foreground max-w-sm text-center">
                {intent}
              </p>
            )}

            {/* Timer */}
            <SessionTimerDisplay
              formattedTime={formattedTime}
              isRunning={isRunning}
              progress={progress}
            />

            {/* Pause/Resume */}
            <Button
              variant="ghost"
              onClick={handlePauseResume}
              className="text-muted-foreground hover:text-foreground transition-calm"
            >
              {isRunning ? "Pause" : "Resume"}
            </Button>
          </div>
        )}

        {phase === "closure" && (
          <SessionClosure
            onStop={handleStop}
            onContinue={handleContinue}
          />
        )}
      </main>
    </div>
  );
};

export default Work;
