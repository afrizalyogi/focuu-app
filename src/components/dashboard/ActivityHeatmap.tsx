import { useMemo } from "react";
import { SessionRecord } from "@/hooks/useSessionHistory";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityHeatmapProps {
  sessions: SessionRecord[];
  timeframe?: "week" | "month" | "year";
}

const ActivityHeatmap = ({
  sessions,
  timeframe = "year",
}: ActivityHeatmapProps) => {
  // Generate data based on timeframe
  const calendarData = useMemo(() => {
    const today = new Date();
    const days = [];

    // Determine start date based on timeframe
    let daysToGenerate = 365;
    if (timeframe === "week") daysToGenerate = 7;
    if (timeframe === "month") daysToGenerate = 180; // Expanded to 180 days for denser view

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (daysToGenerate - 1));

    // Create map of date -> minutes
    const intensityMap = new Map<string, number>();
    sessions.forEach((session) => {
      const current = intensityMap.get(session.date) || 0;
      intensityMap.set(session.date, current + session.durationMinutes);
    });

    for (let i = 0; i < daysToGenerate; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];
      const minutes = intensityMap.get(dateStr) || 0;

      days.push({
        date: dateStr,
        minutes,
        dayOfWeek: currentDate.getDay(), // 0 = Sun, 6 = Sat
      });
    }
    return days;
  }, [sessions, timeframe]);

  // Group by weeks for horizontal rendering (Month/Year)
  const weeks = useMemo(() => {
    if (timeframe === "week") return []; // Not used for week view

    const weekGroups = [];
    let currentWeek = [];

    // For Github style, we need to respect day of week alignment?
    // User said "looks like github".
    // Simple fill for now:
    calendarData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }

    return weekGroups;
  }, [calendarData, timeframe]);

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return "bg-secondary/50";
    if (minutes < 25) return "bg-primary/30"; // Changed green to primary
    if (minutes < 60) return "bg-primary/50";
    if (minutes < 120) return "bg-primary/70";
    return "bg-primary";
  };

  // Week View: Single Row
  if (timeframe === "week") {
    return (
      <div className="w-full">
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((day) => (
            <TooltipProvider key={day.date}>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-full aspect-square rounded-sm transition-all hover:scale-105",
                      getIntensityClass(day.minutes),
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-semibold">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </p>
                  <p className="text-xs">{day.minutes} mins</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    );
  }

  // Month & Year View
  return (
    <div className="w-full overflow-hidden">
      <div className="w-full">
        <div
          className={cn(
            "flex w-full justify-between items-stretch",
            timeframe === "year" ? "gap-0.5" : "gap-1",
          )}
        >
          {weeks.map((week, wIndex) => (
            <div
              key={wIndex}
              className={cn(
                "flex-1 flex flex-col min-w-[3px]",
                timeframe === "year" ? "gap-0.5" : "gap-1",
              )}
            >
              {week.map((day, dIndex) => {
                if (!day)
                  return <div key={`empty-${dIndex}`} className="flex-1" />;
                return (
                  <TooltipProvider key={day.date}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex-1 rounded-[1px] transition-colors hover:ring-1 hover:ring-ring aspect-square",
                            getIntensityClass(day.minutes),
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {day.minutes} mins on {day.date}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-secondary/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
