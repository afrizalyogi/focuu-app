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
  Square,
  Coffee,
  Maximize,
  RefreshCw,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import ShareAchievement from "@/components/dashboard/ShareAchievement";
import FocusChart from "@/components/dashboard/FocusChart";
import Navbar from "@/components/layout/Navbar";
import TopUsersTable from "@/components/dashboard/TopUsersTable";
import FeedbackDialog from "@/components/common/FeedbackDialog";
import AppBackground from "@/components/layout/AppBackground";

const AppDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();
  const {
    sessions,
    isLoading,
    getTotalStats,
    getDaySummaries,
    refreshSessions,
  } = useSessionHistory();

  const stats = getTotalStats();
  // Using separate state for Heatmap timeframe (default 'year')
  const [heatmapTimeframe, setHeatmapTimeframe] = useState<
    "week" | "month" | "year"
  >("month");
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
  const isStreakActiveToday = () => {
    // Added
    const today = new Date().toISOString().split("T")[0];
    return sessions?.some((s) => s.date === today) ?? false;
  };

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

  const suggestion = getSuggestion(); // Moved here as per instruction's implied order

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      <AppBackground />

      {/* Main Content */}
      <main className="relative z-10 container max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Welcome back,{" "}
              <span className="text-primary">
                {profile?.display_name?.split(" ")[0] || "Creator"}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to find your flow today?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleStartSession}
              size="lg"
              className="group px-8 py-5 text-base font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
            >
              Enter work mode
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Overview</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSessions}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>

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
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
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
                onClick={() => navigate("/app/billing")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-calm">
                      <Users className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="font-medium text-foreground">Billing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription, view invoices and payment history.
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
          {/* Recent Activity Preview (Commented out) */}

          {/* Leaderboard & Focus Volume (Flex with 1:3 ratio) */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Focus Journey
            </h2>
            <div className="flex flex-col lg:flex-row gap-4 items-stretch mb-8">
              <div className="flex-1 flex flex-col">
                <TopUsersTable enableTabs={true} />
              </div>
              <div className="flex-[2] flex flex-col">
                <FocusChart />
              </div>
            </div>
          </div>

          {/* Focus History (Heatmap) Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
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
