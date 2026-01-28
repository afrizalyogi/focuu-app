import { useSessionHistory } from "@/hooks/useSessionHistory";
import { cn } from "@/lib/utils";

interface HistoryMiniViewProps {
  isPro: boolean;
  onUpgradeClick: () => void;
}

const HistoryMiniView = ({ isPro, onUpgradeClick }: HistoryMiniViewProps) => {
  const { sessions } = useSessionHistory();

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const weekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    return sessionDate >= weekStart;
  });

  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Get unique days this week
  const uniqueDays = new Set(
    weekSessions.map(s => new Date(s.completedAt).toDateString())
  ).size;

  return (
    <div className="w-full space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        Presence
      </p>

      <div className="relative">
        <div 
          className={cn(
            "grid grid-cols-3 gap-3 p-4 rounded-lg bg-secondary/50",
            !isPro && "blur-[3px]"
          )}
        >
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">{todayMinutes}</p>
            <p className="text-[10px] text-muted-foreground uppercase">min today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">{uniqueDays}</p>
            <p className="text-[10px] text-muted-foreground uppercase">days this week</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">{weekSessions.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">sessions</p>
          </div>
        </div>

        {/* Overlay for free users */}
        {!isPro && (
          <div 
            onClick={onUpgradeClick}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group rounded-lg"
          >
            <p className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-calm">
              Your work history starts here →
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryMiniView;
