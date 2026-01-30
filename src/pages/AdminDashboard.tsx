import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Trophy,
  FlaskConical,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePresenceCount } from "@/hooks/usePresenceCount";
import { supabase } from "@/integrations/supabase/client";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import HeatmapVisualizer from "@/components/analytics/HeatmapVisualizer";
import UsageFrequencyCharts from "@/components/analytics/UsageFrequencyCharts";
import FeatureStats from "@/components/analytics/FeatureStats";
import { PageViewsChart } from "@/components/dashboard/PageViewsChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import TopUsersTable from "@/components/dashboard/TopUsersTable";
import PricingManagement from "@/components/dashboard/PricingManagement";

interface GlobalStats {
  totalUsers: number;
  totalSessions: number;
  activeSessions: number;
  totalMinutes: number;
  avgSessionLength: number;
  activeTrials: number;
  proConversion: number;
  csatScore: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const presenceCount = usePresenceCount();
  const displayPresenceCount = presenceCount;

  // Fetch global stats using useQuery for better reliability
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-global-stats"],
    queryFn: async () => {
      // 1. Total Users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 2. Total Sessions & Minutes
      const { data: sessionData, error } = await supabase
        .from("sessions")
        .select("id, duration_minutes, created_at, completed_at, completed");

      if (error) throw error;

      const totalMins = sessionData?.reduce(
        (acc, curr) => acc + (curr.duration_minutes || 0),
        0,
      );
      const completedSessions =
        sessionData?.filter((s) => s.completed).length || 0;

      // 3. Active Sessions Estimate
      const activeCount =
        sessionData?.filter(
          (s) =>
            !s.completed &&
            new Date(s.created_at).getTime() > Date.now() - 2 * 60 * 60 * 1000,
        ).length || 0;

      // 4. Subscription Stats
      const { data: profiles } = await supabase
        .from("profiles")
        .select("subscription_status, is_pro");

      const trialCount =
        profiles?.filter((p) => p.subscription_status === "trial").length || 0;
      const proCount = profiles?.filter((p) => p.is_pro).length || 0;
      const conversionRate = userCount
        ? Math.round((proCount / userCount) * 100)
        : 0;

      // 5. CSAT Score
      const { data: feedback } = await supabase
        .from("user_feedback")
        .select("rating");

      const avgRating =
        feedback && feedback.length > 0
          ? feedback.reduce((acc, curr) => acc + curr.rating, 0) /
            feedback.length
          : 0;

      const avgSession = completedSessions
        ? Math.round(totalMins / completedSessions)
        : 0;

      // Prepare heatmap data
      const heatmapData =
        sessionData
          ?.filter((s) => s.completed && s.completed_at)
          .map((s) => ({
            id: typeof s.id === "string" ? s.id : Math.random().toString(), // Ensure ID
            date: s.completed_at,
            completedAt: s.completed_at,
            durationMinutes: s.duration_minutes,
            energyMode: "normal" as const,
            intent: "session",
          })) || [];

      return {
        stats: {
          totalUsers: userCount || 0,
          totalSessions: completedSessions,
          activeSessions: activeCount,
          totalMinutes: totalMins || 0,
          avgSessionLength: avgSession,
          activeTrials: trialCount,
          proConversion: conversionRate,
          csatScore: avgRating,
        },
        heatmapData,
      };
    },
    enabled: !!isAdmin, // Only fetch if user is confirmed admin
    retry: 3, // Retry up to 3 times on failure
  });

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      navigate("/app");
    }
  }, [isAdmin, navigate]);

  const stats = statsData?.stats || {
    totalUsers: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalMinutes: 0,
    avgSessionLength: 0,
    activeTrials: 0,
    proConversion: 0,
    csatScore: 0,
  };

  const globalSessions = statsData?.heatmapData || [];
  const loading = isLoadingStats;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="-mx-6 -mt-6 mb-8 bg-background/80 backdrop-blur-sm border-b border-border/20 px-6">
          <Navbar />
        </div>

        {/* 1. KEY METRICS: 11 Cards (Users -> Revenue) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* 1. Total Users */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  registered accounts
                </p>
              </CardContent>
            </Card>

            {/* 2. Realtime Active */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Realtime Active
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayPresenceCount}</div>
                <p className="text-xs text-muted-foreground">
                  users online now
                </p>
              </CardContent>
            </Card>

            {/* 3. User Satisfaction */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  User Satisfaction
                </CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : stats.csatScore > 0
                      ? stats.csatScore.toFixed(1)
                      : "-"}
                </div>
                <p className="text-xs text-muted-foreground">average rating</p>
              </CardContent>
            </Card>

            {/* 4. Total Focus Time */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Focus Time
                </CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : Math.round(stats.totalMinutes / 60).toLocaleString()}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    hrs
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  cumulative global
                </p>
              </CardContent>
            </Card>

            {/* 5. Total Sessions */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sessions
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.totalSessions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  sessions completed
                </p>
              </CardContent>
            </Card>

            {/* 6. Avg Session Length */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Session
                </CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.avgSessionLength}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    min
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">per session</p>
              </CardContent>
            </Card>

            {/* 7. Active Trials */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Trials
                </CardTitle>
                <FlaskConical className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.activeTrials}
                </div>
                <p className="text-xs text-muted-foreground">
                  potential conversions
                </p>
              </CardContent>
            </Card>

            {/* 8. Pro Conversion */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pro Conversion
                </CardTitle>
                <Trophy className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : `${stats.proConversion}%`}
                </div>
                <p className="text-xs text-muted-foreground">conversion rate</p>
              </CardContent>
            </Card>

            {/* 9. MRR */}
            <Card className="bg-card/50 border-border/30 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  MRR (Est.)
                </CardTitle>
                <span className="text-green-500 font-bold">$</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  $
                  {(
                    stats.activeTrials * 0 +
                    Math.round(stats.totalUsers * (stats.proConversion / 100)) *
                      9
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  monthly recurring
                </p>
              </CardContent>
            </Card>

            {/* 10. ARPU */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ARPU
                </CardTitle>
                <span className="text-green-500 font-bold">$</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {stats.totalUsers > 0
                    ? (
                        (Math.round(
                          stats.totalUsers * (stats.proConversion / 100),
                        ) *
                          9) /
                        stats.totalUsers
                      ).toFixed(2)
                    : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">avg rev / user</p>
              </CardContent>
            </Card>

            {/* 11. LTV */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  LTV (Est.)
                </CardTitle>
                <span className="text-blue-500 font-bold">$</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  ${(9 * 12).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">12-month value</p>
              </CardContent>
            </Card>

            {/* 12. Est. Project Value */}
            <Card className="bg-card/50 border-border/30 bg-purple-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stats Value (Est.)
                </CardTitle>
                <span className="text-purple-500 font-bold">$</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">
                  $
                  {(
                    (stats.activeTrials * 0 +
                      Math.round(
                        stats.totalUsers * (stats.proConversion / 100),
                      ) *
                        9) *
                    24
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  24-month run rate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 2. REVENUE TRACK & FORECAST */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Revenue Performance</h2>
          <div className="w-full h-full">
            <RevenueChart />
          </div>
        </div>

        {/* 3. USAGE ANALYTICS & GLOBAL HEATMAP */}
        {/* 3. PEAK USAGE & ACTIVITY (Separated) */}

        {/* Peak Usage Time */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Peak Usage Time</h2>
          <div>
            <UsageFrequencyCharts />
          </div>
        </div>

        {/* Global Activity Heatmap */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Global Activity Heatmap</h2>
          <Card className="bg-card/50 border-border/30 h-full">
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap sessions={globalSessions} timeframe="year" />
            </CardContent>
          </Card>
        </div>

        {/* 4. FEATURE ADOPTION & PAGE VIEWS (Flex) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Adoption & Engagement</h2>
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 w-full">
              <FeatureStats />
            </div>
            <div className="flex-1 w-full">
              <PageViewsChart />
            </div>
          </div>
        </div>

        {/* 5. TOP FOCUS WARRIOR & COMPONENT ANALYTICS */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Leaderboard & Components</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TopUsersTable enableTabs={true} />
            </div>
            <div className="lg:col-span-2">
              {/* Renaming HeatmapVisualizer to "Component Analytics" contextually if possible, 
                     or treating it as such. It's the heatmap interaction visualizer. */}
              <HeatmapVisualizer />
            </div>
          </div>
        </div>

        {/* 6. PRICING MANAGEMENT */}
        <div className="space-y-4">
          <PricingManagement />
        </div>

        {/* 7. DB MANAGEMENT */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">System</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Database Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage user records, subscriptions, and system configurations.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/app/settings")}
              >
                Go to Settings
              </Button>
            </CardHeader>
            <CardContent>
              {/* Placeholder for future DB tools */}
              <div className="h-20 flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  Advanced tables coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
