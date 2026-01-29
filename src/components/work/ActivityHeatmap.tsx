import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
  weeks?: number;
}

const ActivityHeatmap = ({ data, weeks = 12 }: ActivityHeatmapProps) => {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7 - 1));
    
    // Create a map of date -> count
    const countMap = new Map<string, number>();
    data.forEach(d => {
      countMap.set(d.date, d.count);
    });
    
    // Generate all days
    const days: { date: string; count: number; dayOfWeek: number; weekIndex: number }[] = [];
    const current = new Date(startDate);
    
    let weekIndex = 0;
    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: countMap.get(dateStr) || 0,
        dayOfWeek: current.getDay(),
        weekIndex,
      });
      
      if (current.getDay() === 6) weekIndex++;
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [data, weeks]);

  const maxCount = Math.max(...heatmapData.map(d => d.count), 1);

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-secondary/30";
    const intensity = count / maxCount;
    if (intensity <= 0.25) return "bg-primary/25";
    if (intensity <= 0.5) return "bg-primary/50";
    if (intensity <= 0.75) return "bg-primary/75";
    return "bg-primary";
  };

  // Group by weeks
  const weekGroups: typeof heatmapData[] = [];
  heatmapData.forEach(day => {
    if (!weekGroups[day.weekIndex]) {
      weekGroups[day.weekIndex] = [];
    }
    weekGroups[day.weekIndex].push(day);
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    heatmapData.forEach(day => {
      const month = new Date(day.date).getMonth();
      if (month !== lastMonth) {
        labels.push({
          month: new Date(day.date).toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: day.weekIndex,
        });
        lastMonth = month;
      }
    });
    
    return labels;
  }, [heatmapData]);

  return (
    <div className="space-y-2">
      {/* Month labels */}
      <div className="flex gap-1 ml-8">
        {monthLabels.map((label, i) => (
          <span
            key={i}
            className="text-[10px] text-muted-foreground/60"
            style={{ marginLeft: `${label.weekIndex * 14}px` }}
          >
            {label.month}
          </span>
        ))}
      </div>
      
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((day, i) => (
            <span
              key={day}
              className={cn(
                "text-[9px] text-muted-foreground/50 h-[12px] flex items-center",
                i % 2 === 0 ? "" : "invisible"
              )}
            >
              {day}
            </span>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <div className="flex gap-1">
          {weekGroups.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map(day => (
                <div
                  key={day.date}
                  className={cn(
                    "w-3 h-3 rounded-sm transition-colors",
                    getIntensityClass(day.count)
                  )}
                  title={`${day.date}: ${day.count} sessions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 ml-8">
        <span className="text-[10px] text-muted-foreground/50">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-secondary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/25" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary/75" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span className="text-[10px] text-muted-foreground/50">More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
