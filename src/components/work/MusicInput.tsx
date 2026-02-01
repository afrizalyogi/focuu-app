import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music, X, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicInputProps {
  value: string;
  // title: string; // Deprecated
  onChange: (url: string, title?: string) => void;
  isPro: boolean;
  onUpgradeClick?: () => void;
}

const MusicInput = ({
  value,
  // title,
  onChange,
  isPro,
  onUpgradeClick,
}: MusicInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = () => {
    onChange(inputValue, "");
    setIsExpanded(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("", "");
  };

  if (!isExpanded && !value) {
    return (
      <button
        onClick={() => (isPro ? setIsExpanded(true) : onUpgradeClick?.())}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all",
          "bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30",
          !isPro && "opacity-60",
        )}
      >
        <Music className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {isPro ? "Add background music" : "Background music (Pro)"}
        </span>
      </button>
    );
  }

  if (value && !isExpanded) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-card/30 border border-border/30">
        {/* Spinning Disc */}
        <div
          className="relative w-10 h-10 group cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
            <Music className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Controls - Simplified */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded bg-secondary/50"
          >
            Change
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-xl bg-card/30 border border-border/30 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Music URL</span>
      </div>

      <Input
        type="url"
        placeholder="YouTube, Spotify, or direct audio URL"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="bg-secondary/50 border-border/50"
      />

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!inputValue.trim()}>
          {value ? "Update" : "Play"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsExpanded(false);
            setInputValue(value);
          }}
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/60">
        Supports YouTube, Spotify, SoundCloud, or direct audio file URLs
      </p>
    </div>
  );
};

export default MusicInput;
