import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

// Mock data generator since payment table might be empty
const generateMockRevenue = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  let revenue = 1200;
  return months.map((month) => {
    revenue = revenue * (1 + (Math.random() * 0.3 - 0.05)); // -5% to +25% growth
    return {
      month,
      revenue: Math.round(revenue),
      isForecast: false,
    };
  });
};

const RevenueChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Payments (Track Record)
      const { data: payments, error: paymentError } = await supabase
        .from("payments")
        .select("amount_cents, created_at")
        .eq("status", "succeeded")
        .order("created_at", { ascending: true });

      if (paymentError) throw paymentError;

      // 2. Fetch Active Subscriptions (Forecast Basis)
      const { data: subs, error: subError } = await supabase
        .from("subscriptions")
        .select("plan_type") // In a real app complexity, we'd link to price.
        .eq("status", "active");

      if (subError) throw subError;

      // 3. Fetch Pricing (to estimate Forecast value)
      const { data: plans, error: planError } = await supabase
        .from("pricing_plans")
        .select("interval, price_cents")
        .eq("is_active", true);

      if (planError) throw planError;

      // PROCESS DATA

      // A. Group Payments by Month
      const monthlyRevenue = new Map<string, number>();
      const monthOrder: string[] = []; // To keep sort order

      (payments || []).forEach((pay) => {
        const date = new Date(pay.created_at);
        const monthKey = date.toLocaleString("default", { month: "short" });

        // Simple sorting mechanism: relying on DB sort mostly, but map preserves insertion order
        if (!monthlyRevenue.has(monthKey)) {
          monthlyRevenue.set(monthKey, 0);
          monthOrder.push(monthKey);
        }

        monthlyRevenue.set(
          monthKey,
          (monthlyRevenue.get(monthKey) || 0) + (pay.amount_cents || 0) / 100,
        );
      });

      // Transform to Chart Data
      const historyData = monthOrder.map((month) => ({
        month,
        revenue: Math.round(monthlyRevenue.get(month) || 0),
        type: "Actual",
      }));

      // If no history, add dummy start or empty
      if (historyData.length === 0) {
        const currentMonth = new Date().toLocaleString("default", {
          month: "short",
        });
        historyData.push({ month: currentMonth, revenue: 0, type: "Actual" });
      }

      // B. Calculate Forecast (MRR from Subs)
      // Estimate MRR: Sum of (Monthly Price) + (Yearly Price / 12)
      let forecastMRR = 0;

      const avgMonthlyPrice =
        plans?.find((p) => p.interval === "monthly")?.price_cents || 900;
      const avgYearlyPrice =
        plans?.find((p) => p.interval === "yearly")?.price_cents || 9000;

      (subs || []).forEach((sub) => {
        if (sub.plan_type === "monthly") forecastMRR += avgMonthlyPrice / 100;
        if (sub.plan_type === "yearly")
          forecastMRR += avgYearlyPrice / 100 / 12;
      });

      // Growth Factor (Simple 10% optimism for the example if MRR > 0, else 0)
      const nextMonthForecast = Math.round(
        forecastMRR > 0 ? forecastMRR * 1.1 : 0,
      );

      // Determine label for next month
      const lastMonthLabel = historyData[historyData.length - 1].month;
      // Rough next month logic (simplistic)
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const lastIdx = months.indexOf(lastMonthLabel);
      const nextIdx = (lastIdx + 1) % 12;
      const nextMonthLabel = months[nextIdx] + " (Est)";

      const forecastData = {
        month: nextMonthLabel,
        revenue: nextMonthForecast,
        type: "Forecast",
      };

      setData([...historyData, forecastData]);
    } catch (err) {
      console.error("Failed to load revenue data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-1 h-full min-h-[300px]">
      <CardHeader>
        <CardTitle>Revenue Track Record</CardTitle>
        <CardDescription>
          Real payment history & subscription-based forecast
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Analyzing revenue trends...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <pattern
                  id="patternForecast"
                  patternUnits="userSpaceOnUse"
                  width="4"
                  height="4"
                >
                  <path
                    d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <XAxis
                dataKey="month"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                }}
                formatter={(value: number, name: string, props: any) => {
                  const type = props.payload.type;
                  return [`$${value.toLocaleString()}`, type];
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorActual)"
              />
              {/* Note: In a real advanced chart, we'd split the 'Area' into two to style Forecast differently (dashed/pattern). 
                  For now, we use a single line for continuity. */}
              <ReferenceLine
                x={data[data.length - 2]?.month} // Start of forecast
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                label="Forecast"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
