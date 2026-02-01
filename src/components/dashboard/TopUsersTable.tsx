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

      const { data, error } = await withRetry(async () => {
        // Use the secure RPC function to fetch leaderboard data
        return await supabase.rpc("get_leaderboard");
      });

      if (data) {
        // Map the RPC result to our component state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaderboard: TopUser[] = (data as any[]).map((u) => ({
          id: u.id,
          // Truncate email if lengthy or use display name
          email: u.display_name || u.email || `User ${u.id.slice(0, 4)}`,
          totalMinutes: u.total_minutes || 0,
          totalSessions: u.total_sessions || 0,
          streak: u.current_streak || 0,
          isPro: u.is_pro || false,
        }));

        setUsers(leaderboard);
      } else if (error) {
        console.error("Leaderboard fetch error:", error);
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
    <Card className="col-span-1 min-h-[400px] h-full shadow-sm border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 items-center">
          <div className="text-center space-y-1">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
              <span>Top Focus</span>
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
              className="w-full max-w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-9">
                <TabsTrigger
                  value="time"
                  className="text-xs px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Time
                </TabsTrigger>
                <TabsTrigger
                  value="streak"
                  className="text-xs px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Streak
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!enableTabs && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] opacity-70"
            >
              Global Ranking
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted/20 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted/20 animate-pulse rounded" />
                    <div className="h-3 w-16 bg-muted/20 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            sortedUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between group relative"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank with Podium Colors */}
                  <div
                    className={`
                    w-10 h-10 flex shrink-0 items-center justify-center rounded-full font-bold text-base shadow-sm
                    ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500 ring-2 ring-yellow-500/20"
                        : index === 1
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 ring-2 ring-slate-500/20"
                          : index === 2
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-600 ring-2 ring-orange-700/20"
                            : "bg-muted/50 text-muted-foreground"
                    }
                  `}
                  >
                    {index + 1}
                  </div>

                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Avatar className="hidden md:block h-10 w-10 border border-border/40 shrink-0">
                      <AvatarFallback className="bg-primary/5 text-primary font-medium text-xs">
                        {user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate text-foreground/90">
                          {user.email.split("@")[0]}
                        </span>
                        {user.isPro && (
                          <Crown className="w-3 h-3 text-amber-500 fill-amber-500/20 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground/60" />
                          {Math.round(user.totalMinutes / 60)}h
                        </div>
                        <div className="flex items-center gap-1 text-orange-500 font-medium">
                          <Flame className="w-3 h-3 fill-orange-500/20" />
                          {user.streak} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score / Main Stat */}
                <div className="text-right pl-4">
                  <div className="flex flex-col items-end">
                    {sortBy === "streak" ? (
                      <span className="font-bold text-sm">{user.streak}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm">
                          {Math.round(user.totalMinutes / 60)}
                        </span>
                        <Crown className="w-3 h-3 text-yellow-500/50" />
                      </div>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {sortBy === "streak" ? "days" : "hours"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {!loading && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Trophy className="w-8 h-8 opacity-20" />
              <p className="text-sm">No champions yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopUsersTable;
