import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Flame, Clock, Trophy } from "lucide-react";
import { withRetry } from "@/utils/dbHelper";

interface TopUser {
  id: string;
  email: string;
  totalMinutes: number;
  totalSessions: number;
  streak: number;
  isPro: boolean;
}

interface TopUsersTableProps {
  enableTabs?: boolean;
}

const TopUsersTable = ({ enableTabs = false }: TopUsersTableProps) => {
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"time" | "streak">("time");

  useEffect(() => {
    const fetchTopUsers = async () => {
      setLoading(true);

      const { data: profiles } = await withRetry(async () => {
        return await supabase
          .from("profiles")
          .select("id, email, is_pro, current_streak, username");
      });

      const { data: sessions } = await withRetry(async () => {
        return await supabase
          .from("sessions")
          .select("user_id, duration_minutes")
          .eq("completed", true);
      });

      if (profiles && sessions) {
        const userStats = new Map<string, { minutes: number; count: number }>();

        sessions.forEach((s) => {
          if (!s.user_id) return;
          const current = userStats.get(s.user_id) || { minutes: 0, count: 0 };
          current.minutes += s.duration_minutes || 0;
          current.count += 1;
          userStats.set(s.user_id, current);
        });

        const leaderboard = profiles
          .map((p) => {
            const stats = userStats.get(p.id) || { minutes: 0, count: 0 };
            return {
              id: p.id,
              email: p.username || p.email || `User ${p.id.slice(0, 4)}`,
              totalMinutes: stats.minutes,
              totalSessions: stats.count,
              streak: p.current_streak || 0,
              isPro: p.is_pro || false,
            };
          })
          .filter((u) => u.totalMinutes > 0);

        setUsers(leaderboard);
      }
      setLoading(false);
    };

    fetchTopUsers();
  }, []);

  const sortedUsers = [...users]
    .sort((a, b) => {
      if (sortBy === "streak") return b.streak - a.streak;
      return b.totalMinutes - a.totalMinutes;
    })
    .slice(0, 5);

  return (
    <Card className="col-span-1 min-h-[400px]">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Focus Warriors
              </CardTitle>
              <CardDescription>
                Ranked by {sortBy === "time" ? "focus hours" : "daily streak"}
              </CardDescription>
            </div>
            {enableTabs && (
              <Tabs
                defaultValue="time"
                value={sortBy}
                onValueChange={(v) => setSortBy(v as "time" | "streak")}
                className="w-auto"
              >
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="time" className="text-xs px-2">
                    Time
                  </TabsTrigger>
                  <TabsTrigger value="streak" className="text-xs px-2">
                    Streak
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            {!enableTabs && (
              <Badge variant="secondary" className="font-mono text-xs">
                Global
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/20 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            sortedUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className={`
                    w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                    ${
                      index === 0
                        ? "bg-yellow-500/20 text-yellow-600"
                        : index === 1
                          ? "bg-gray-300/30 text-gray-400"
                          : index === 2
                            ? "bg-orange-700/20 text-orange-700"
                            : "bg-muted text-muted-foreground"
                    }
                  `}
                  >
                    {index + 1}
                  </div>

                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {user.email}
                        </span>
                        {user.isPro && (
                          <Crown className="w-3 h-3 text-primary fill-primary/20" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(user.totalMinutes / 60)}h
                        </div>
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="w-3 h-3" />
                          {user.streak} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI */}
                <div className="text-right">
                  <div className="font-mono font-medium text-sm">
                    {sortBy === "streak" ? (
                      <>
                        {user.streak}{" "}
                        <span className="text-xs text-muted-foreground">
                          days
                        </span>
                      </>
                    ) : (
                      <>
                        {user.totalSessions}{" "}
                        <span className="text-xs text-muted-foreground">
                          sessions
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {!loading && users.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No data available yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopUsersTable;
