import { Flame, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  isAtRisk?: boolean;
  size?: "sm" | "md" | "lg";
}

const StreakDisplay = ({ 
  currentStreak, 
  longestStreak, 
  isActiveToday,
  isAtRisk = false,
  size = "md" 
}: StreakDisplayProps) => {
  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: "w-5 h-5",
      number: "text-2xl",
      text: "text-xs",
    },
    md: {
      container: "p-4",
      icon: "w-6 h-6",
      number: "text-3xl",
      text: "text-sm",
    },
    lg: {
      container: "p-6",
      icon: "w-8 h-8",
      number: "text-4xl",
      text: "text-base",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(
      "rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30",
      classes.container,
      isActiveToday && "border-primary/30 bg-primary/5"
    )}>
      <div className="flex items-center gap-3">
        {/* Flame/Ice icon */}
        <div className={cn(
          "rounded-xl p-2",
          isAtRisk ? "bg-muted/20" : isActiveToday ? "bg-primary/20" : "bg-orange-500/20"
        )}>
          {isAtRisk ? (
            <Snowflake className={cn(classes.icon, "text-muted-foreground")} />
          ) : (
            <Flame className={cn(
              classes.icon,
              isActiveToday ? "text-primary" : "text-orange-500",
              currentStreak > 0 && "animate-pulse"
            )} />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className={cn(classes.number, "font-bold text-foreground")}>
              {currentStreak}
            </span>
            <span className={cn(classes.text, "text-muted-foreground")}>
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          
          <p className={cn(classes.text, "text-muted-foreground/60")}>
            {isActiveToday 
              ? "Streak active today" 
              : isAtRisk 
                ? "Streak at risk" 
                : "Current streak"
            }
          </p>
        </div>
      </div>
      
      {/* Longest streak indicator */}
      {longestStreak > currentStreak && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className={cn(classes.text, "text-muted-foreground/60")}>
            Best: <span className="text-foreground">{longestStreak} days</span>
          </p>
        </div>
      )}
      
      {/* Visual streak dots */}
      {currentStreak > 0 && currentStreak <= 7 && (
        <div className="mt-3 flex gap-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < currentStreak 
                  ? isActiveToday ? "bg-primary" : "bg-orange-500"
                  : "bg-muted/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
