import { useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Share2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type TimeRange = "Week" | "Month" | "Year" | "All";

const FocusChart = () => {
  const { sessions, getDaySummaries } = useSessionHistory();
  const { hasProAccess } = useAuth();
  const [range, setRange] = useState<TimeRange>("Week");
  const chartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const data = useMemo(() => {
    let days = 7;
    if (range === "Month") days = 30;
    if (range === "Year") days = 365;
    if (range === "All") days = 365 * 5; // Arbitrary 'ALL'

    const rawData = getDaySummaries(days).reverse();

    // Transform for Recharts
    return rawData.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        weekday: range === "Week" ? "short" : undefined,
        day: range !== "Week" ? "numeric" : undefined,
        month: range === "Year" || range === "All" ? "short" : "short",
      }),
      minutes: d.totalMinutes,
      fullDate: d.date,
    }));
  }, [range, sessions, getDaySummaries]);

  const totalMinutes = data.reduce((acc, curr) => acc + curr.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / (data.length || 1));

  // Determine color based on trend (green for now as focus is good)
  const chartColor = "#10b981"; // Emerald-500

  const generateImage = () => {
    if (!chartRef.current) return null;

    // Find SVG
    const svg = chartRef.current.querySelector("svg");
    if (!svg) return null;

    // Serialize SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Set canvas size (add padding for title)
        const width = svg.clientWidth || 600;
        const height = svg.clientHeight || 300;
        const headerHeight = 100;

        canvas.width = width;
        canvas.height = height + headerHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw Background
        ctx.fillStyle = "#09090b"; // Dark bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Header Text
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Focuu Growth Chart", 20, 40);

        ctx.font = "16px Inter, sans-serif";
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText(`Avg Daily Focus: ${avgMinutes}m`, 20, 70);

        // Draw Chart
        ctx.drawImage(img, 0, headerHeight);

        // Draw Watermark
        ctx.font = "12px Inter, sans-serif";
        ctx.fillStyle = "#52525b";
        ctx.textAlign = "right";
        ctx.fillText("focuu.site/app", canvas.width - 20, 40);

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownload = async () => {
    if (!hasProAccess) {
      toast("Pro Feature Locked", {
        description: "Upgrade to Pro to download high-quality charts.",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/pricing"),
        },
      });
      return;
    }
    try {
      const dataUrl = await generateImage();
      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `focuu-chart-${range}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      console.error("Failed to generate image", e);
      toast.error("Failed to generate download");
    }
  };

  const handleShare = async () => {
    if (!hasProAccess) {
      toast("Pro Feature Locked", {
        description: "Upgrade to Pro to share your growth pattern.",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/pricing"),
        },
      });
      return;
    }
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `focuu-chart-${range}.png`, {
        type: "image/png",
      });

      if (navigator.share) {
        await navigator.share({
          title: "My Focus Growth",
          text: "Check out my focus consistency on Focuu!",
          files: [file],
        });
      } else {
        toast.error("Sharing not supported on this device/browser");
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-2 border-b border-border/10">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {range === "Week" && avgMinutes}
              {range === "Month" && avgMinutes}
              {range === "Year" && avgMinutes}
              {range === "All" && avgMinutes}
              <span className="text-sm text-muted-foreground font-normal ml-1">
                min
              </span>
            </span>
            <span className="text-xs text-emerald-500 font-medium">
              Avg. Daily
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Share Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-2 border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300",
                !hasProAccess
                  ? "text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={handleDownload}
              title={!hasProAccess ? "Upgrade to Download" : "Download Chart"}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:text-xs">
                Download
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-2 border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300",
                !hasProAccess
                  ? "text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={handleShare}
              title={!hasProAccess ? "Upgrade to Share" : "Share Chart"}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:text-xs">Share</span>
            </Button>
          </div>

          {/* TradingView-style Range Selector */}
          <div className="flex bg-secondary/30 rounded-lg p-0.5">
            {(["Week", "Month", "Year", "All"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  range === r
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 h-[350px] w-full" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2e39" // Darker grid like trading view
              vertical={false}
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
              tickMargin={10}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}m`}
              tickMargin={10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b", // Zinc-950
                borderColor: "#27272a", // Zinc-800
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
              itemStyle={{
                fontSize: "12px",
                fontWeight: 500,
                color: chartColor,
              }}
              labelStyle={{
                color: "#a1a1aa",
                marginBottom: "4px",
                fontSize: "12px",
              }}
              formatter={(value: any) => [`${value} mins`, "Focus Time"]}
              cursor={{
                stroke: chartColor,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#focusGradient)"
              activeDot={{ r: 4, strokeWidth: 0, fill: chartColor }}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FocusChart;
