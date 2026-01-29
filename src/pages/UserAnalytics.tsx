import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import Navbar from "@/components/layout/Navbar";
import GlassOrbs from "@/components/landing/GlassOrbs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar,
  Target,
  ArrowLeft,
  Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WeeklyComparison {
  currentWeek: number;
  lastWeek: number;
  percentChange: number;
  trend: "up" | "down" | "same";
}

const UserAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, getDaySummaries, getTotalStats } = useSessionHistory();
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison | null>(null);

  const stats = getTotalStats();
  const last14Days = getDaySummaries(14);

  // Calculate weekly comparison
  useEffect(() => {
    const thisWeekDays = last14Days.slice(0, 7);
    const lastWeekDays = last14Days.slice(7, 14);

    const currentWeekMinutes = thisWeekDays.reduce((acc, d) => acc + d.totalMinutes, 0);
    const lastWeekMinutes = lastWeekDays.reduce((acc, d) => acc + d.totalMinutes, 0);

    const percentChange = lastWeekMinutes > 0 
      ? Math.round(((currentWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
      : currentWeekMinutes > 0 ? 100 : 0;

    setWeeklyComparison({
      currentWeek: currentWeekMinutes,
      lastWeek: lastWeekMinutes,
      percentChange,
      trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "same",
    });
  }, [last14Days]);

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Calculate streak from sessions
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    
    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    // Check if streak is active
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
    
    let streak = 0;
    let checkDate = new Date(uniqueDates[0]);
    
    for (const dateStr of uniqueDates) {
      const date = new Date(dateStr);
      const diff = Math.floor((checkDate.getTime() - date.getTime()) / 86400000);
      
      if (diff <= 1) {
        streak++;
        checkDate = date;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Best day analysis
  const bestDay = last14Days.reduce((best, day) => 
    day.totalMinutes > best.totalMinutes ? day : best
  , { date: "", totalMinutes: 0, sessionsCount: 0 });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlassOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/app")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </button>
              <h1 className="text-2xl md:text-3xl font-bold">Your Analytics</h1>
              <p className="text-muted-foreground mt-1">Track your work patterns and progress</p>
            </div>
          </div>

          {/* Weekly Comparison Card */}
          {weeklyComparison && (
            <Card className="bg-card/40 backdrop-blur-xl border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Weekly Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">This Week</p>
                    <p className="text-3xl font-bold">{formatMinutes(weeklyComparison.currentWeek)}</p>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Last Week</p>
                    <p className="text-3xl font-bold text-muted-foreground">
                      {formatMinutes(weeklyComparison.lastWeek)}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Change</p>
                    <div className="flex items-center justify-center gap-2">
                      {weeklyComparison.trend === "up" ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : weeklyComparison.trend === "down" ? (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      ) : null}
                      <p className={`text-3xl font-bold ${
                        weeklyComparison.trend === "up" ? "text-green-500" :
                        weeklyComparison.trend === "down" ? "text-red-500" :
                        "text-muted-foreground"
                      }`}>
                        {weeklyComparison.percentChange > 0 ? "+" : ""}{weeklyComparison.percentChange}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/40 backdrop-blur-xl border-border/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatMinutes(stats.totalMinutes)}</p>
                    <p className="text-xs text-muted-foreground">Total focus time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{streak}</p>
                    <p className="text-xs text-muted-foreground">Day streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.daysPresent}</p>
                    <p className="text-xs text-muted-foreground">Days present</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.avgSessionLength}m</p>
                    <p className="text-xs text-muted-foreground">Avg session</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 14-Day Activity Chart */}
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardHeader>
              <CardTitle>Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-32">
                {last14Days.reverse().map((day, i) => {
                  const maxMinutes = Math.max(...last14Days.map(d => d.totalMinutes), 60);
                  const height = day.totalMinutes > 0 
                    ? Math.max(10, (day.totalMinutes / maxMinutes) * 100) 
                    : 4;
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className={`w-full rounded-t transition-all ${
                          day.totalMinutes > 0 ? "bg-primary" : "bg-muted/30"
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${formatMinutes(day.totalMinutes)}`}
                      />
                      <span className="text-[10px] text-muted-foreground/60">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: "narrow" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bestDay.totalMinutes > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30">
                  <p className="text-sm text-muted-foreground">
                    Best day in the last 2 weeks was{" "}
                    <span className="text-foreground font-medium">
                      {new Date(bestDay.date).toLocaleDateString(undefined, { 
                        weekday: "long", 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </span>
                    {" "}with {formatMinutes(bestDay.totalMinutes)} of focus time.
                  </p>
                </div>
              )}
              
              {stats.avgSessionLength > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30">
                  <p className="text-sm text-muted-foreground">
                    Your average session is{" "}
                    <span className="text-foreground font-medium">{stats.avgSessionLength} minutes</span>.
                    {stats.avgSessionLength < 25 && " Consider trying longer sessions for deeper work."}
                    {stats.avgSessionLength >= 45 && " Great job maintaining deep focus."}
                  </p>
                </div>
              )}

              {weeklyComparison && weeklyComparison.trend === "up" && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    You're on an upward trend. Keep the momentum going.
                  </p>
                </div>
              )}

              {weeklyComparison && weeklyComparison.trend === "down" && weeklyComparison.lastWeek > 0 && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    This week is lighter than last. That's okay—consistency over intensity.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserAnalytics;
