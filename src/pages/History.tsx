import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Timer, ArrowLeft, Download } from "lucide-react";
import { HistoryPageSkeleton } from "@/components/ui/skeleton-loaders";
import ExportDialog from "@/components/history/ExportDialog";
import TimeRangeSelector, { TimeRange } from "@/components/work/TimeRangeSelector";
import { useState, useMemo } from "react";

const History = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessions, isLoading, getDaySummaries, getTotalStats } = useSessionHistory();
  const [showExport, setShowExport] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  const isPro = profile?.is_pro ?? false;

  // Calculate days based on time range
  const rangeDays = useMemo(() => {
    switch (timeRange) {
      case "daily": return 1;
      case "weekly": return 7;
      case "monthly": return 30;
      case "yearly": return 365;
      default: return 7;
    }
  }, [timeRange]);

  const stats = getTotalStats();
  const daySummaries = getDaySummaries(isPro ? rangeDays : 1);

  const isLimited = !isPro;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
        <header className="relative z-10 p-4 md:p-6">
          <button
            onClick={() => navigate("/app")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </header>
        <main className="relative z-10 flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
          <HistoryPageSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/app")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        {isPro && sessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Presence history
          </h1>
          <p className="text-muted-foreground mb-6">
            Not a score. Just proof you were here.
          </p>

          {/* Time Range Selector - Pro only */}
          {isPro && (
            <div className="mb-8">
              <TimeRangeSelector 
                value={timeRange} 
                onChange={setTimeRange}
              />
            </div>
          )}

          {/* Overall stats */}
          <div className="grid grid-cols-3 gap-3 mb-12">
            <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
              <Calendar className="w-4 h-4 text-primary mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">
                {stats.daysPresent}
              </p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">
                {Math.round(stats.totalMinutes / 60)}h
              </p>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
              <Timer className="w-4 h-4 text-primary mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">
                {stats.avgSessionLength}m
              </p>
              <p className="text-xs text-muted-foreground">avg</p>
            </div>
          </div>

          {/* Day list */}
          <div className="space-y-2">
            {daySummaries.map((day, index) => {
              const isToday = index === 0;
              const dateLabel = isToday 
                ? "Today" 
                : new Date(day.date).toLocaleDateString("en-US", { 
                    weekday: "short", 
                    month: "short", 
                    day: "numeric" 
                  });

              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-4 rounded-xl bg-card/30 border border-border/20 hover:border-border/40 transition-calm"
                >
                  <span className="text-foreground font-medium">{dateLabel}</span>
                  <div className="text-right">
                    {day.sessionsCount > 0 ? (
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-medium">
                          {day.totalMinutes} min
                        </span>
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">
                          {day.sessionsCount} session{day.sessionsCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Limited view notice */}
          {isLimited && (
            <div className="mt-10 p-6 rounded-xl bg-secondary/30 border border-border/30 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Free accounts see today only.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="transition-calm"
              >
                See full history
              </Button>
            </div>
          )}
        </div>
      </main>

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        sessions={sessions}
      />
    </div>
  );
};

export default History;
