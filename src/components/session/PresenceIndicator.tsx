interface PresenceIndicatorProps {
  count: number;
  maxCircles?: number;
}

const PresenceIndicator = ({ count, maxCircles = 3 }: PresenceIndicatorProps) => {
  if (count === 0) return null;
  
  const displayCount = Math.min(count, maxCircles);
  const overflow = count - maxCircles;
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {/* Avatar circles */}
      <div className="flex -space-x-2">
        {[...Array(displayCount)].map((_, i) => (
          <span
            key={i}
            className="w-5 h-5 rounded-full bg-focuu-presence/80 border-2 border-background"
          />
        ))}
        {overflow > 0 && (
          <span className="w-5 h-5 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
            +{overflow > 99 ? "99" : overflow}
          </span>
        )}
      </div>
      <span>{count} working now</span>
    </div>
  );
};

export default PresenceIndicator;
