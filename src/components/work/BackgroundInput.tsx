import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Video, X, Upload, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackgroundInputProps {
  imageUrl: string;
  videoUrl: string;
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  isPro: boolean;
  onUpgradeClick?: () => void;
}

const BackgroundInput = ({ 
  imageUrl, 
  videoUrl, 
  onImageChange, 
  onVideoChange, 
  isPro,
  onUpgradeClick 
}: BackgroundInputProps) => {
  const [mode, setMode] = useState<"image" | "video" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const currentValue = mode === "video" ? videoUrl : imageUrl;
  const hasBackground = imageUrl || videoUrl;

  const handleSubmit = () => {
    if (mode === "image") {
      onImageChange(inputValue);
      onVideoChange("");
    } else if (mode === "video") {
      onVideoChange(inputValue);
      onImageChange("");
    }
    setMode(null);
    setInputValue("");
  };

  const handleClear = () => {
    onImageChange("");
    onVideoChange("");
    setMode(null);
    setInputValue("");
  };

  if (!isPro) {
    return (
      <button
        onClick={onUpgradeClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-card/30 border border-border/30 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Image className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Custom background (Pro)</span>
      </button>
    );
  }

  if (hasBackground && !mode) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/30 border border-border/30">
        {videoUrl ? (
          <Video className="w-4 h-4 text-primary" />
        ) : (
          <Image className="w-4 h-4 text-primary" />
        )}
        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
          {videoUrl || imageUrl}
        </span>
        <button
          onClick={() => {
            setMode(videoUrl ? "video" : "image");
            setInputValue(videoUrl || imageUrl);
          }}
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

  if (!mode) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setMode("image")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30 transition-all"
        >
          <Image className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Image background</span>
        </button>
        <button
          onClick={() => setMode("video")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30 transition-all"
        >
          <Video className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Video background</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-xl bg-card/30 border border-border/30 animate-fade-in">
      <div className="flex items-center gap-2">
        {mode === "video" ? (
          <Video className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Image className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground">
          Paste {mode === "video" ? "video" : "image"} URL
        </span>
      </div>
      
      <Input
        type="url"
        placeholder={mode === "video" ? "Video URL (MP4, WebM)" : "Image URL (JPG, PNG, GIF)"}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="bg-secondary/50 border-border/50"
      />
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
        >
          Set background
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setMode(null);
            setInputValue("");
          }}
        >
          Cancel
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground/60">
        Use a direct link to an image or video file
      </p>
    </div>
  );
};

export default BackgroundInput;
