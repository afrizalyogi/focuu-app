import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import {
  ArrowRight,
  Clock,
  Calendar,
  Zap,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Lightbulb,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import ShareAchievement from "@/components/dashboard/ShareAchievement";
import FocusChart from "@/components/dashboard/FocusChart";
import Navbar from "@/components/layout/Navbar";
import TopUsersTable from "@/components/dashboard/TopUsersTable";

const AppDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { sessions, isLoading, getTotalStats, getDaySummaries } =
    useSessionHistory();

  const stats = getTotalStats();
  // Using separate state for Heatmap timeframe (default 'year')
  const [heatmapTimeframe, setHeatmapTimeframe] = useState<
    "week" | "month" | "year"
  >("year");
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week");

  const activeData = (() => {
    switch (timeframe) {
      case "week":
        return getDaySummaries(7).reverse();
      case "month":
        return getDaySummaries(90).reverse(); // Increased to 90 days as requested (approx 3 months)
      case "year":
        return getDaySummaries(365)
          .filter((_, i) => i % 30 === 0)
          .reverse(); // Very rough approx for year view
      default:
        return getDaySummaries(7).reverse();
    }
  })();

  const maxSessionCount = Math.max(
    ...activeData.map((d) => d.sessionsCount),
    1,
  );
  const recentDays = getDaySummaries(7);
  const isPro = profile?.is_pro ?? false;

  const handleStartSession = () => {
    navigate("/work");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Calculate insights
  const avgMinutesPerDay =
    stats.daysPresent > 0
      ? Math.round(stats.totalMinutes / stats.daysPresent)
      : 0;

  const streakDays = (() => {
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    for (let i = 0; i < recentDays.length; i++) {
      if (recentDays[i].sessionsCount > 0) streak++;
      else break;
    }
    return streak;
  })();

  const getSuggestion = () => {
    if (stats.totalSessions === 0) {
      return "Start your first session to begin tracking your focus patterns.";
    }
    if (stats.avgSessionLength < 20) {
      return "Try extending your sessions to 25+ minutes for deeper focus states.";
    }
    if (streakDays === 0) {
      return "Getting back on track? Even a short session helps maintain momentum.";
    }
    if (streakDays >= 3) {
      return `You're on a ${streakDays}-day streak! Consistency is building strong work habits.`;
    }
    return "Keep showing up. Every session strengthens your focus muscle.";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 border-b border-border/20">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
          {/* Welcome & Quick Action */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {user?.email}
                {isPro && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                    Pro
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={handleStartSession}
              size="lg"
              className="group px-8 py-5 text-base font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
            >
              Enter work mode
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-card/50 border-border/30">
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-4 mb-2" />
                      <Skeleton className="h-8 w-16 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card className="bg-card/50 border-border/30 hover:bg-card/70 transition-calm">
                  <CardContent className="p-4">
                    <Zap className="w-4 h-4 text-primary mb-2" />
                    <p className="text-2xl font-semibold text-foreground">
                      {stats.totalSessions}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      total sessions
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/30 hover:bg-card/70 transition-calm">
                  <CardContent className="p-4">
                    <Calendar className="w-4 h-4 text-primary mb-2" />
                    <p className="text-2xl font-semibold text-foreground">
                      {stats.daysPresent}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      days present
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/30 hover:bg-card/70 transition-calm">
                  <CardContent className="p-4">
                    <Clock className="w-4 h-4 text-primary mb-2" />
                    <p className="text-2xl font-semibold text-foreground">
                      {stats.totalMinutes >= 60
                        ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`
                        : `${stats.totalMinutes}m`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      time focused
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/30 hover:bg-card/70 transition-calm">
                  <CardContent className="p-4">
                    <TrendingUp className="w-4 h-4 text-primary mb-2" />
                    <p className="text-2xl font-semibold text-foreground">
                      {stats.avgSessionLength}m
                    </p>
                    <p className="text-xs text-muted-foreground">avg session</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Insights & Suggestion */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Insight</h3>
                  <p className="text-sm text-muted-foreground">
                    {getSuggestion()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="bg-card/50 border-border/30 hover:bg-card/70 hover:border-primary/30 transition-calm cursor-pointer group"
                onClick={() => navigate("/work")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-calm">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-foreground">
                      Focus Session
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start a timed work session. Track tasks and stay in the
                    flow.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="bg-card/50 border-border/30 hover:bg-card/70 hover:border-primary/30 transition-calm cursor-pointer group"
                onClick={() => navigate("/app/history")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-calm">
                      <History className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="font-medium text-foreground">History</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review your past sessions and track your consistency over
                    time.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="bg-card/50 border-border/30 hover:bg-card/70 hover:border-primary/30 transition-calm cursor-pointer group"
                onClick={() => navigate("/app/settings")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-calm">
                      <Settings className="w-4 h-4 text-orange-500" />
                    </div>
                    <h3 className="font-medium text-foreground">Settings</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customize your experience, manage account, and preferences.
                  </p>
                </CardContent>
              </Card>
              {isAdmin && (
                <Card
                  className="bg-card/50 border-border/30 hover:bg-card/70 hover:border-yellow-500/30 transition-calm cursor-pointer group"
                  onClick={() => navigate("/admin")}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-calm">
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                      <h3 className="font-medium text-foreground">Admin</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Platform analytics, user metrics, and system health.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Activity Preview */}
          {stats.totalSessions > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground">
                  Recent activity
                </h2>
                <div className="flex bg-secondary/50 rounded-lg p-1">
                  {(["week", "month", "year"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`
                        px-3 py-1 text-xs font-medium rounded-md transition-all
                        ${
                          timeframe === t
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <Card className="bg-card/50 border-border/30">
                <CardContent className="p-4">
                  <div className="flex gap-2 min-h-[100px] items-end">
                    {activeData.map((day, i) => {
                      const heightPercent =
                        maxSessionCount > 0
                          ? (day.sessionsCount / maxSessionCount) * 100
                          : 0;

                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center gap-2 group relative"
                        >
                          <div
                            className={`
                              w-full rounded-t-sm transition-all duration-500 ease-out
                              ${
                                day.sessionsCount > 0
                                  ? "bg-primary/80 group-hover:bg-primary"
                                  : "bg-secondary/30"
                              }
                            `}
                            style={{
                              height: `${Math.max(heightPercent, 4)}%`,
                              minHeight: "4px",
                            }}
                          />
                          <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                            {new Date(day.date)
                              .toLocaleDateString("en-US", {
                                weekday:
                                  timeframe === "week" ? "short" : undefined,
                                day:
                                  timeframe !== "week" ? "numeric" : undefined,
                                month:
                                  timeframe === "year" ? "short" : undefined,
                              })
                              .slice(0, 3)}
                          </span>

                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10 pointer-events-none">
                            {new Date(day.date).toLocaleDateString()}
                            <br />
                            {day.sessionsCount} sessions
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Weekly Leaderboard */}
          <div className="mb-8">
            <TopUsersTable enableTabs={true} />
          </div>

          {/* Focus Volume Section */}
          <div className="mb-8 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">
                Focus Volume
              </h2>
            </div>
            <FocusChart />
          </div>

          {/* Focus History (Heatmap) Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">
                Activity Heatmap
              </h2>
              <div className="flex bg-secondary/50 rounded-lg p-1">
                {(["week", "month", "year"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHeatmapTimeframe(t)}
                    className={`
                          px-3 py-1 text-xs font-medium rounded-md transition-all
                          ${
                            heatmapTimeframe === t
                              ? "bg-background shadow-sm text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }
                        `}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4">
                <ActivityHeatmap
                  sessions={sessions}
                  timeframe={heatmapTimeframe}
                />
              </CardContent>
            </Card>
          </div>
          {/* Share Achievement Section */}
          <div className="mb-8">
            <ShareAchievement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
