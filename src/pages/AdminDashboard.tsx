import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import GlassOrbs from "@/components/landing/GlassOrbs";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  UserPlus,
  BarChart3,
  Activity,
  Zap,
  Calendar,
  ArrowLeft,
  Shield,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminStats {
  totalUsers: number;
  activeUsers7d: number;
  trialUsers: number;
  proUsers: number;
  totalSessions: number;
  avgSessionLength: number;
}

interface OnboardingStats {
  totalCompleted: number;
  energyDistribution: { low: number; okay: number; high: number };
  pressureDistribution: { push: number; steady: number; support: number };
}

interface BehaviorStats {
  topEvents: { event_type: string; count: number }[];
  sessionsByHour: number[];
  dropOffPoints: { page: string; count: number }[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [onboardingStats, setOnboardingStats] = useState<OnboardingStats | null>(null);
  const [behaviorStats, setBehaviorStats] = useState<BehaviorStats | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!error && !!data);
      setIsLoading(false);
    };

    checkAdmin();
  }, [user]);

  // Fetch admin stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      // User stats
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, is_pro, subscription_status, created_at");

      if (profiles) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setAdminStats({
          totalUsers: profiles.length,
          activeUsers7d: profiles.filter(p => 
            new Date(p.created_at) > sevenDaysAgo
          ).length,
          trialUsers: profiles.filter(p => p.subscription_status === "trial").length,
          proUsers: profiles.filter(p => p.is_pro).length,
          totalSessions: 0,
          avgSessionLength: 0,
        });
      }

      // Session stats
      const { data: sessions } = await supabase
        .from("sessions")
        .select("duration_minutes");

      if (sessions && adminStats) {
        const total = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
        setAdminStats(prev => prev ? {
          ...prev,
          totalSessions: sessions.length,
          avgSessionLength: sessions.length > 0 ? Math.round(total / sessions.length) : 0,
        } : null);
      }

      // Onboarding stats
      const { data: onboarding } = await supabase
        .from("onboarding_preferences")
        .select("energy_level, pressure_preference");

      if (onboarding) {
        const energyDist = { low: 0, okay: 0, high: 0 };
        const pressureDist = { push: 0, steady: 0, support: 0 };

        onboarding.forEach(o => {
          if (o.energy_level && energyDist.hasOwnProperty(o.energy_level)) {
            energyDist[o.energy_level as keyof typeof energyDist]++;
          }
          if (o.pressure_preference && pressureDist.hasOwnProperty(o.pressure_preference)) {
            pressureDist[o.pressure_preference as keyof typeof pressureDist]++;
          }
        });

        setOnboardingStats({
          totalCompleted: onboarding.length,
          energyDistribution: energyDist,
          pressureDistribution: pressureDist,
        });
      }

      // Behavior stats
      const { data: analytics } = await supabase
        .from("user_analytics")
        .select("event_type, page, created_at")
        .order("created_at", { ascending: false })
        .limit(10000);

      if (analytics) {
        // Top events
        const eventCounts: Record<string, number> = {};
        analytics.forEach(a => {
          eventCounts[a.event_type] = (eventCounts[a.event_type] || 0) + 1;
        });
        const topEvents = Object.entries(eventCounts)
          .map(([event_type, count]) => ({ event_type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Sessions by hour
        const hourCounts = new Array(24).fill(0);
        analytics.forEach(a => {
          const hour = new Date(a.created_at).getHours();
          hourCounts[hour]++;
        });

        // Page counts (drop-off analysis)
        const pageCounts: Record<string, number> = {};
        analytics.forEach(a => {
          if (a.page) {
            pageCounts[a.page] = (pageCounts[a.page] || 0) + 1;
          }
        });
        const dropOffPoints = Object.entries(pageCounts)
          .map(([page, count]) => ({ page, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setBehaviorStats({
          topEvents,
          sessionsByHour: hourCounts,
          dropOffPoints,
        });
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-xl font-medium text-muted-foreground mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground/60 mb-6">
          You don't have permission to view this page.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlassOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
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
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Monitor user activity and app metrics</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* User Overview */}
          {adminStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adminStats.totalUsers}</p>
                      <p className="text-xs text-muted-foreground">Total users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-500/10">
                      <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adminStats.activeUsers7d}</p>
                      <p className="text-xs text-muted-foreground">Active (7d)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adminStats.trialUsers}</p>
                      <p className="text-xs text-muted-foreground">On trial</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adminStats.proUsers}</p>
                      <p className="text-xs text-muted-foreground">Pro users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs for different analytics */}
          <Tabs defaultValue="behavior" className="space-y-6">
            <TabsList className="bg-card/40 backdrop-blur-xl border border-border/30">
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="behavior" className="space-y-6">
              {behaviorStats && (
                <>
                  {/* Top Events */}
                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <CardTitle>Top Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {behaviorStats.topEvents.map((event, i) => (
                          <div key={event.event_type} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                            <span className="text-sm">{event.event_type}</span>
                            <span className="text-sm font-medium text-primary">{event.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity by Hour */}
                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <CardTitle>Activity by Hour</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-1 h-32">
                        {behaviorStats.sessionsByHour.map((count, hour) => {
                          const max = Math.max(...behaviorStats.sessionsByHour, 1);
                          const height = (count / max) * 100;
                          return (
                            <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full bg-primary rounded-t transition-all"
                                style={{ height: `${Math.max(height, 2)}%` }}
                                title={`${hour}:00 - ${count} events`}
                              />
                              {hour % 4 === 0 && (
                                <span className="text-[10px] text-muted-foreground/60">{hour}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Page Distribution */}
                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <CardTitle>Page Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {behaviorStats.dropOffPoints.map((page, i) => (
                          <div key={page.page} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                            <span className="text-sm font-mono">{page.page}</span>
                            <span className="text-sm font-medium">{page.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="onboarding" className="space-y-6">
              {onboardingStats && (
                <>
                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <CardTitle>Onboarding Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{onboardingStats.totalCompleted}</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                      <CardHeader>
                        <CardTitle>Energy Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(onboardingStats.energyDistribution).map(([level, count]) => (
                            <div key={level} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{level}</span>
                                <span>{count}</span>
                              </div>
                              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ 
                                    width: `${(count / Math.max(onboardingStats.totalCompleted, 1)) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                      <CardHeader>
                        <CardTitle>Pressure Preference</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(onboardingStats.pressureDistribution).map(([pref, count]) => (
                            <div key={pref} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{pref}</span>
                                <span>{count}</span>
                              </div>
                              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ 
                                    width: `${(count / Math.max(onboardingStats.totalCompleted, 1)) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              {adminStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <CardTitle>Total Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{adminStats.totalSessions}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <CardTitle>Avg Session Length</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{adminStats.avgSessionLength}m</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
