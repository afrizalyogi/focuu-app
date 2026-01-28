interface PresenceIndicatorProps {
  count: number;
}

const PresenceIndicator = ({ count }: PresenceIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {/* Subtle presence dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-focuu-presence animate-pulse-soft" />
      <span>{count} people working now</span>
    </div>
  );
};

export default PresenceIndicator;
