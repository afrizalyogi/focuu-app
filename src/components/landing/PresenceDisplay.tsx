interface PresenceDisplayProps {
  count: number;
}

const PresenceDisplay = ({ count }: PresenceDisplayProps) => {
  if (count === 0) return null;

  return (
    <div className="animate-fade-up flex items-center gap-3 px-4 py-2 rounded-xl bg-card/30 backdrop-blur-xl border border-border/30" style={{ animationDelay: "400ms" }}>
      {/* Tighter stacked circles without letters */}
      <div className="flex -space-x-3">
        {[...Array(Math.min(count, 5))].map((_, i) => (
          <div 
            key={i} 
            className="w-7 h-7 rounded-full border-2 border-background"
            style={{
              background: `linear-gradient(135deg, hsl(var(--primary) / ${0.6 - i * 0.1}) 0%, hsl(var(--primary) / ${0.3 - i * 0.05}) 100%)`,
              zIndex: 5 - i,
            }}
          />
        ))}
        {count > 5 && (
          <div 
            className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-medium"
            style={{ zIndex: 0 }}
          >
            +{count - 5}
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
