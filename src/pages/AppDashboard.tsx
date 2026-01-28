import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedModes } from "@/hooks/useSavedModes";
import { useSessionHistory } from "@/hooks/useSessionHistory";

const AppDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { getDefaultMode } = useSavedModes();
  const { getTotalStats } = useSessionHistory();

  const defaultMode = getDefaultMode();
  const stats = getTotalStats();
  const isPro = profile?.is_pro ?? false;

  const handleStartSession = () => {
    navigate("/work");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg font-medium text-foreground">focuu</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/settings")}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            Settings
          </button>
          <button
            onClick={signOut}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center gap-10 animate-fade-up">
          {/* Greeting - calm, observational */}
          <div className="text-center">
            <p className="text-muted-foreground mb-1">
              You're back
            </p>
            <p className="text-foreground text-sm">
              {user?.email}
            </p>
          </div>

          {/* Quick stats - proof of presence, not productivity */}
          {stats.totalSessions > 0 && (
            <div className="flex gap-10 text-center">
              <div>
                <p className="text-3xl font-medium text-foreground">
                  {stats.daysPresent}
                </p>
                <p className="text-xs text-muted-foreground mt-1">days present</p>
              </div>
              <div>
                <p className="text-3xl font-medium text-foreground">
                  {Math.round(stats.totalMinutes / 60)}h
                </p>
                <p className="text-xs text-muted-foreground mt-1">time here</p>
              </div>
            </div>
          )}

          {/* Default mode indicator */}
          {defaultMode && isPro && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Your rhythm</p>
              <p className="text-sm text-foreground">
                {defaultMode.name} · {defaultMode.sessionLength} min
              </p>
            </div>
          )}

          {/* Start button */}
          <Button
            onClick={handleStartSession}
            size="lg"
            className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
          >
            Start working
          </Button>

          {/* Navigation links */}
          <div className="flex gap-6 text-sm">
            <button
              onClick={() => navigate("/app/history")}
              className="text-muted-foreground hover:text-foreground transition-calm"
            >
              History
            </button>
            <button
              onClick={() => navigate("/app/modes")}
              className="text-muted-foreground hover:text-foreground transition-calm"
            >
              Saved modes
            </button>
          </div>

          {/* Pro upgrade hint - soft, not pushy */}
          {!isPro && (
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-calm"
            >
              Remove small frictions
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
