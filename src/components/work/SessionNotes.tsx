import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SessionNotesProps {
  isPro: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onUpgradeClick: () => void;
}

const SessionNotes = ({ isPro, notes, onNotesChange, onUpgradeClick }: SessionNotesProps) => {
  return (
    <div className="w-full space-y-3 p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        Session Notes
      </p>

      <div className="relative">
        <Textarea
          placeholder={isPro ? "Capture thoughts without leaving focus..." : "Capture thoughts without leaving focus."}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={!isPro}
          className={cn(
            "min-h-[100px] bg-secondary/50 border border-border/50 focus-visible:ring-1 focus-visible:ring-primary resize-none",
            !isPro && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Locked overlay for free users */}
        {!isPro && (
          <div 
            onClick={onUpgradeClick}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group rounded-md"
          >
            <p className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-calm px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm">
              Unlock with Pro →
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionNotes;
