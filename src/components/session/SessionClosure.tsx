import { Button } from "@/components/ui/button";

interface SessionClosureProps {
  onStop: () => void;
  onContinue: () => void;
}

const SessionClosure = ({ onStop, onContinue }: SessionClosureProps) => {
  return (
    <div className="flex flex-col items-center gap-8 animate-fade-up">
      {/* Message */}
      <div className="text-center">
        <p className="text-2xl md:text-3xl font-medium text-foreground mb-2">
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
          className="px-6 transition-calm"
        >
          Continue 15 min
        </Button>
        <Button
          onClick={onStop}
          className="px-6 transition-calm"
        >
          Stop
        </Button>
      </div>
    </div>
  );
};

export default SessionClosure;
