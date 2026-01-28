import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SessionRecord } from "@/hooks/useSessionHistory";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: SessionRecord[];
}

type Granularity = "hourly" | "daily" | "weekly" | "monthly";
type DateRange = "daily" | "weekly" | "monthly" | "yearly";

const ExportDialog = ({ open, onOpenChange, sessions }: ExportDialogProps) => {
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [dateRange, setDateRange] = useState<DateRange>("monthly");

  const filterSessionsByRange = (range: DateRange): SessionRecord[] => {
    const now = new Date();
    let cutoff: Date;

    switch (range) {
      case "daily":
        cutoff = new Date(now.setDate(now.getDate() - 1));
        break;
      case "weekly":
        cutoff = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        cutoff = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "yearly":
        cutoff = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    return sessions.filter(s => new Date(s.completedAt) >= cutoff);
  };

  const aggregateByGranularity = (
    data: SessionRecord[],
    gran: Granularity
  ): Array<{ period: string; totalMinutes: number; sessionsCount: number }> => {
    const map = new Map<string, { totalMinutes: number; sessionsCount: number }>();

    data.forEach(session => {
      const date = new Date(session.completedAt);
      let key: string;

      switch (gran) {
        case "hourly":
          key = `${session.date} ${date.getHours().toString().padStart(2, "0")}:00`;
          break;
        case "daily":
          key = session.date;
          break;
        case "weekly": {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Week of ${weekStart.toISOString().split("T")[0]}`;
          break;
        }
        case "monthly":
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          break;
      }

      const existing = map.get(key) || { totalMinutes: 0, sessionsCount: 0 };
      existing.totalMinutes += session.durationMinutes;
      existing.sessionsCount += 1;
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => b.period.localeCompare(a.period));
  };

  const handleExport = () => {
    const filtered = filterSessionsByRange(dateRange);
    const aggregated = aggregateByGranularity(filtered, granularity);

    const headers = ["Period", "Total Minutes", "Sessions Count", "Average Session (min)"];
    const rows = aggregated.map(row => [
      row.period,
      row.totalMinutes.toString(),
      row.sessionsCount.toString(),
      row.sessionsCount > 0 ? Math.round(row.totalMinutes / row.sessionsCount).toString() : "0",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `focuu-sessions-${dateRange}-${granularity}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Work Sessions</DialogTitle>
          <DialogDescription>
            Choose how you want to export your work data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Granularity selection */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Timeline granularity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["hourly", "daily", "weekly", "monthly"] as Granularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-calm ${
                    granularity === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date range selection */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Date range
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["daily", "weekly", "monthly", "yearly"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-calm ${
                    dateRange === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "daily" ? "Last day" : 
                   r === "weekly" ? "Last week" : 
                   r === "monthly" ? "Last month" : "Last year"}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export as CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
