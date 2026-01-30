import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PageViewsChart = () => {
  const [data, setData] = useState<{ name: string; views: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: analyticsData } = await supabase
        .from("user_analytics")
        .select("page");

      if (analyticsData) {
        const counts: Record<string, number> = {};
        analyticsData.forEach((item) => {
          // Normalize/Clean path
          let page = item.page || "/";
          if (page === "") page = "/";
          counts[page] = (counts[page] || 0) + 1;
        });

        // Convert to array and sort
        const chartData = Object.entries(counts)
          .map(([name, views]) => ({ name, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10); // Top 10 pages

        setData(chartData);
      }
    };
    fetchData();
  }, []);

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Total Page Views</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "none",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#adfa1d" : "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
