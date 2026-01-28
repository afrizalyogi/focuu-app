import { Button } from "@/components/ui/button";

interface SessionClosureProps {
  onStop: () => void;
  onContinue: () => void;
  isPro?: boolean;
  onUpgradeClick?: () => void;
}

const SessionClosure = ({ onStop, onContinue, isPro = false, onUpgradeClick }: SessionClosureProps) => {
  return (
    <div className="flex flex-col items-center gap-10 animate-fade-up">
      {/* Message - per PRD micro-copy */}
      <div className="text-center">
        <p className="text-2xl md:text-3xl font-medium text-foreground mb-3">
          Enough for now?
        </p>
        <p className="text-muted-foreground">
          You were here. That's enough.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onContinue}
          className="px-6 py-5 transition-calm"
        >
          Continue 15 min
        </Button>
        <Button
          onClick={onStop}
          className="px-8 py-5 transition-calm"
        >
          Done
        </Button>
      </div>

      {/* Soft upgrade copy for free users - per PRD conversion strategy */}
      {!isPro && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-calm mt-4"
        >
          Save this rhythm for later →
        </button>
      )}
    </div>
  );
};

export default SessionClosure;
