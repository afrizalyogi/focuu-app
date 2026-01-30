import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music, X, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicInputProps {
  value: string;
  title: string;
  onChange: (url: string, title?: string) => void;
  isPro: boolean;
  onUpgradeClick?: () => void;
}

const MusicInput = ({
  value,
  title,
  onChange,
  isPro,
  onUpgradeClick,
}: MusicInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [inputTitle, setInputTitle] = useState(title);

  const handleSubmit = () => {
    onChange(inputValue, inputTitle);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setInputValue("");
    setInputTitle("");
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
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/30 border border-border/30">
        <Music className="w-4 h-4 text-primary" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {title || "Now Playing"}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {value}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="text-xs text-primary hover:underline ml-2"
        >
          Change
        </button>
        <button
          onClick={handleClear}
          className="p-1 hover:bg-destructive/20 rounded-full transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-xl bg-card/30 border border-border/30 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Music Details</span>
      </div>

      <Input
        type="text"
        placeholder="Station Name (e.g. Lofi Beats)"
        value={inputTitle}
        onChange={(e) => setInputTitle(e.target.value)}
        className="bg-secondary/50 border-border/50"
      />

      <Input
        type="url"
        placeholder="YouTube, Spotify, or direct audio URL"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="bg-secondary/50 border-border/50"
      />

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!inputValue.trim()}>
          {value ? "Update" : "Add music"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsExpanded(false);
            setInputValue(value);
            setInputTitle(title);
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
