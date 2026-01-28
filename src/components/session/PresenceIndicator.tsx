interface PresenceIndicatorProps {
  count: number;
}

const PresenceIndicator = ({ count }: PresenceIndicatorProps) => {
  if (count === 0) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {/* Subtle presence dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-focuu-presence animate-pulse-soft" />
      <span>{count} working now</span>
    </div>
  );
};

export default PresenceIndicator;
