interface PresenceDisplayProps {
  count: number;
}

const PresenceDisplay = ({ count }: PresenceDisplayProps) => {
  if (count === 0) return null;

  count = count + 10;

  return (
    <div
      className="animate-fade-up flex items-center gap-3 px-4 py-2 rounded-xl bg-card/30 backdrop-blur-xl border border-border/30"
      style={{ animationDelay: "400ms" }}
    >
      {/* Tight stacked circles - full opacity, overlapping */}
      <div className="flex -space-x-2">
        {[...Array(Math.min(count, 3))].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-background"
            style={{
              background: `linear-gradient(135deg, #4ade80 0%, #22c55e 100%)`,
              zIndex: 3 - i,
            }}
          />
        ))}
        {count > 3 && (
          <div
            className="w-6 h-6 rounded-full border-2 border-background bg-green-500 flex items-center justify-center text-[9px] text-white font-semibold"
            style={{ zIndex: 0 }}
          >
            +{count - 3}
          </div>
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        {count} {count === 1 ? "person" : "people"} working right now
      </span>
    </div>
  );
};

export const NavbarPresence = ({ count }: PresenceDisplayProps) => {
  if (count === 0) return null;

  count = count + 10;

  return (
    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>{count} working now</span>
    </div>
  );
};

export default PresenceDisplay;
