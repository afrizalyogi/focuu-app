import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UsageFrequencyCharts = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: sessions, error } = await supabase
        .from("sessions")
        .select("created_at");

      if (error) {
        console.error("Error fetching session stats:", error);
      } else if (sessions) {
        // Process Hourly
        const hours = new Array(24).fill(0);
        // Process Daily (0=Sun, 6=Sat)
        const days = new Array(7).fill(0);

        sessions.forEach((s) => {
          const date = new Date(s.created_at);
          hours[date.getHours()]++;
          days[date.getDay()]++;
        });

        setHourlyData(
          hours.map((count, hour) => ({
            name: `${hour}:00`,
            count,
          })),
        );

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        setDailyData(
          days.map((count, i) => ({
            name: dayNames[i],
            count,
          })),
        );
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Peak Usage Times</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="hourly">By Hour</TabsTrigger>
            <TabsTrigger value="daily">By Day</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "hsl(var(--card))",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="daily" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "hsl(var(--card))",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UsageFrequencyCharts;
