import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { Button } from "@/components/ui/button";

const History = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { getDaySummaries, getTotalStats } = useSessionHistory();

  const isPro = profile?.is_pro ?? false;
  const stats = getTotalStats();
  const daySummaries = getDaySummaries(isPro ? 30 : 1);

  // Free users only see today
  const isLimited = !isPro;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 md:p-6">
        <button
          onClick={() => navigate("/app")}
          className="text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          ← Back
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Presence history
          </h1>
          <p className="text-muted-foreground mb-8">
            Not a productivity score. Just proof you were here.
          </p>

          {/* Overall stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-card rounded-lg p-4 text-center">
              <p className="text-2xl font-medium text-foreground">
                {stats.daysPresent}
              </p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
            <div className="bg-card rounded-lg p-4 text-center">
              <p className="text-2xl font-medium text-foreground">
                {Math.round(stats.totalMinutes / 60)}h
              </p>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
            <div className="bg-card rounded-lg p-4 text-center">
              <p className="text-2xl font-medium text-foreground">
                {stats.avgSessionLength}m
              </p>
              <p className="text-xs text-muted-foreground">avg</p>
            </div>
          </div>

          {/* Day list */}
          <div className="space-y-3">
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
                  className="flex items-center justify-between py-3 border-b border-border"
                >
                  <span className="text-foreground">{dateLabel}</span>
                  <div className="text-right">
                    {day.sessionsCount > 0 ? (
                      <>
                        <span className="text-foreground">
                          {day.totalMinutes} min
                        </span>
                        <span className="text-muted-foreground text-sm ml-2">
                          · {day.sessionsCount} session{day.sessionsCount > 1 ? "s" : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Limited view notice */}
          {isLimited && (
            <div className="mt-8 text-center">
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
    </div>
  );
};

export default History;
