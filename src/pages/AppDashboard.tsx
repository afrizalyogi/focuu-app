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
  LogOut
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AppDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { sessions, isLoading, getTotalStats, getDaySummaries } = useSessionHistory();

  const stats = getTotalStats();
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
  const avgMinutesPerDay = stats.daysPresent > 0 
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6 border-b border-border/30">
        <button
          onClick={() => navigate("/")}
          className="text-lg font-semibold text-foreground/80 hover:text-foreground transition-calm"
        >
          focuu
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

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
                    <p className="text-xs text-muted-foreground">total sessions</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/30 hover:bg-card/70 transition-calm">
                  <CardContent className="p-4">
                    <Calendar className="w-4 h-4 text-primary mb-2" />
                    <p className="text-2xl font-semibold text-foreground">
                      {stats.daysPresent}
                    </p>
                    <p className="text-xs text-muted-foreground">days present</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/30 hover:bg-card/70 transition-calm">
                  <CardContent className="p-4">
                    <Clock className="w-4 h-4 text-primary mb-2" />
                    <p className="text-2xl font-semibold text-foreground">
                      {stats.totalMinutes >= 60 
                        ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`
                        : `${stats.totalMinutes}m`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">time focused</p>
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
            <h2 className="text-lg font-medium text-foreground mb-4">What you can do</h2>
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
                    <h3 className="font-medium text-foreground">Focus Sessions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start a timed work session with flexible or pomodoro mode. Track tasks and take notes while you work.
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="bg-card/50 border-border/30 hover:bg-card/70 hover:border-primary/30 transition-calm cursor-pointer group"
                onClick={() => navigate("/work")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-calm">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-foreground">Work Together</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    See others working right now. Join the community of focused workers and stay motivated together.
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="bg-card/50 border-border/30 hover:bg-card/70 hover:border-primary/30 transition-calm cursor-pointer group"
                onClick={() => navigate("/app/history")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-calm">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-foreground">Track Progress</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View your history, export data, and analyze your focus patterns over time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Preview */}
          {stats.totalSessions > 0 && (
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Recent activity</h2>
              <Card className="bg-card/50 border-border/30">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    {recentDays.slice(0, 7).reverse().map((day, i) => (
                      <div 
                        key={day.date} 
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div 
                          className={`
                            w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                            ${day.sessionsCount > 0 
                              ? "bg-primary/20 text-primary" 
                              : "bg-secondary/50 text-muted-foreground/50"
                            }
                          `}
                        >
                          {day.sessionsCount > 0 ? day.sessionsCount : "·"}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex items-center gap-6 pt-4 border-t border-border/30">
            <button
              onClick={() => navigate("/app/history")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => navigate("/app/settings")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
