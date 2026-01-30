import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Music, Image, Palette } from "lucide-react";

interface FeatureStat {
  name: string;
  count: number;
  percentage: number;
}

const FeatureStats = () => {
  const [stats, setStats] = useState<{
    music: FeatureStat[];
    background: FeatureStat[];
    theme: FeatureStat[];
  }>({ music: [], background: [], theme: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Fetch session_start events where we now store feature usage
      const { data, error } = await supabase
        .from("user_analytics")
        .select("event_data")
        .eq("event_type", "session_start")
        .not("event_data->features", "is", null);

      if (error) {
        console.error("Error fetching feature stats:", error);
      } else if (data) {
        const musicCounts: Record<string, number> = {};
        const bgCounts: Record<string, number> = {};
        const themeCounts: Record<string, number> = {};
        let totalEvents = 0;

        data.forEach((d: any) => {
          const features = d.event_data?.features;
          if (!features) return;

          totalEvents++;

          // Music
          if (features.hasMusic) {
            const title = features.musicTitle || "Unknown";
            musicCounts[title] = (musicCounts[title] || 0) + 1;
          }

          // Background
          if (features.hasCustomBg && features.bgType) {
            bgCounts[features.bgType] = (bgCounts[features.bgType] || 0) + 1;
          } else {
            bgCounts["Default"] = (bgCounts["Default"] || 0) + 1;
          }

          // Theme
          if (features.theme) {
            themeCounts[features.theme] =
              (themeCounts[features.theme] || 0) + 1;
          }
        });

        const processStats = (
          counts: Record<string, number>,
        ): FeatureStat[] => {
          // Total should probably be totalEvents for percentages?
          // Or total specific feature users?
          // Let's use totalEvents (Sessions) to show adoption rate per session.
          // Actually, stick to relative popularity within category for "Preference",
          // but "Adoption" implies % of total sessions.
          // User asked for "Adoption" update. Let's show % of Total Sessions.

          return Object.entries(counts)
            .map(([name, count]) => ({
              name,
              count,
              percentage:
                totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5
        };

        setStats({
          music: processStats(musicCounts),
          background: processStats(bgCounts),
          theme: processStats(themeCounts),
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <Card className="col-span-1 h-full min-h-[350px]">
      <CardHeader>
        <CardTitle>Feature Adoption</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background Types */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Image className="w-4 h-4" /> Background
          </div>
          {stats.background.map((stat) => (
            <div key={stat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="capitalize">{stat.name}</span>
                <span className="text-muted-foreground">
                  {stat.percentage}% ({stat.count})
                </span>
              </div>
              <Progress value={stat.percentage} className="h-1.5" />
            </div>
          ))}
          {stats.background.length === 0 && (
            <p className="text-xs text-muted-foreground">No data yet</p>
          )}
        </div>

        {/* Themes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Palette className="w-4 h-4" /> Theme
          </div>
          {stats.theme.map((stat) => (
            <div key={stat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="capitalize">{stat.name}</span>
                <span className="text-muted-foreground">
                  {stat.percentage}% ({stat.count})
                </span>
              </div>
              <Progress value={stat.percentage} className="h-1.5" />
            </div>
          ))}
          {stats.theme.length === 0 && (
            <p className="text-xs text-muted-foreground">No data yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureStats;
