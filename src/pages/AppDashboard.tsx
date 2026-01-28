import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedModes } from "@/hooks/useSavedModes";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { ArrowRight, Clock, Calendar, Zap } from "lucide-react";

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
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg font-semibold text-foreground">focuu</h1>
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
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center gap-8 animate-fade-up max-w-lg w-full">
          {/* Greeting */}
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Welcome back</p>
            <p className="text-foreground text-sm font-medium">{user?.email}</p>
            {isPro && (
              <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                Pro
              </span>
            )}
          </div>

          {/* Quick stats - modern cards */}
          {stats.totalSessions > 0 && (
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
                <Calendar className="w-4 h-4 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">
                  {stats.daysPresent}
                </p>
                <p className="text-xs text-muted-foreground">days present</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
                <Clock className="w-4 h-4 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">
                  {Math.round(stats.totalMinutes / 60)}h
                </p>
                <p className="text-xs text-muted-foreground">time here</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
                <Zap className="w-4 h-4 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">
                  {stats.totalSessions}
                </p>
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
            </div>
          )}

          {/* Default mode indicator */}
          {defaultMode && isPro && (
            <div className="w-full p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Your rhythm</p>
              <p className="text-sm text-foreground font-medium">
                {defaultMode.name} · {defaultMode.sessionLength} min
              </p>
            </div>
          )}

          {/* Start button */}
          <Button
            onClick={handleStartSession}
            size="lg"
            className="group w-full max-w-xs px-10 py-6 text-base font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
          >
            Enter work mode
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

          {/* Pro upgrade hint */}
          {!isPro && (
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-calm"
            >
              Remove small frictions →
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
