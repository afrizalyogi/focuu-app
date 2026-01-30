import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/utils/dbHelper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointerClick, Target, AlertCircle } from "lucide-react";

interface ComponentMetric {
  id: string;
  name: string;
  tag: string;
  hits: number;
  misses: number;
  total: number;
  accuracy: number;
  avgMissDistance: number;
}

const HeatmapVisualizer = () => {
  const [selectedPage, setSelectedPage] = useState<string>("/");
  const [components, setComponents] = useState<ComponentMetric[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await withRetry(async () => {
        return await supabase
          .from("user_analytics")
          .select("event_data")
          .eq("event_type", "heatmap_click")
          .eq("page", selectedPage)
          .limit(2000);
      });

      if (error) {
        console.error("Error fetching analytics:", error);
      } else if (data) {
        const componentMap = new Map<string, ComponentMetric>();

        data.forEach((d: any) => {
          const ed = d.event_data;
          const type =
            ed.interaction_type || (ed.element_id ? "hit" : "general");
          // Skip general clicks on empty space if needed, or track them separately
          if (type === "general") return;

          const key = ed.component_text || ed.element_id || "Unknown Component";
          const current = componentMap.get(key) || {
            id: ed.element_id,
            name: key,
            tag: ed.component_tag || "UNKNOWN",
            hits: 0,
            misses: 0,
            total: 0,
            accuracy: 0,
            avgMissDistance: 0,
          };

          if (type === "hit") {
            current.hits++;
          } else if (type === "miss") {
            current.misses++;
            // Accumulate distance to calc avg later (simple sum for now)
            current.avgMissDistance += ed.distance || 0;
          }
          current.total++;
          componentMap.set(key, current);
        });

        // Compute averages and array
        const metrics = Array.from(componentMap.values())
          .map((c) => ({
            ...c,
            accuracy: c.total > 0 ? Math.round((c.hits / c.total) * 100) : 0,
            avgMissDistance:
              c.misses > 0 ? Math.round(c.avgMissDistance / c.misses) : 0,
          }))
          .sort((a, b) => b.total - a.total);

        setComponents(metrics);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedPage]);

  return (
    <Card className="col-span-1 md:col-span-2 overflow-hidden h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
        <div>
          <CardTitle>Component Analytics</CardTitle>
          <CardDescription>Click accuracy by component</CardDescription>
        </div>
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="/">Landing</SelectItem>
            <SelectItem value="/work">Work</SelectItem>
            <SelectItem value="/pricing">Pricing</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-0">
        <div className="p-4 space-y-4">
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading metrics...
            </div>
          )}

          {!loading && components.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No component interaction data found.
            </div>
          )}

          {!loading &&
            components.map((comp, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{comp.name}</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {comp.tag}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {comp.id || "N/A"}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-green-500">{comp.hits}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">
                      Hits
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`font-bold ${comp.misses > 0 ? "text-orange-500" : "text-muted-foreground"}`}
                    >
                      {comp.misses}
                    </div>
                    <div className="text-[10px] uppercase text-muted-foreground">
                      Misses
                    </div>
                  </div>

                  <div className="flex flex-col items-end min-w-[60px]">
                    <div
                      className={`font-bold ${comp.accuracy < 80 ? "text-red-500" : "text-primary"}`}
                    >
                      {comp.accuracy}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapVisualizer;
