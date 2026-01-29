import { useState, useRef } from "react";
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
  const [inputType, setInputType] = useState<"url" | "file">("url");
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setInputValue(dataUrl);
    };
    reader.readAsDataURL(file);
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
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/30 border border-border/30">
          {videoUrl ? (
            <Video className="w-4 h-4 text-primary" />
          ) : (
            <Image className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {(videoUrl || imageUrl).startsWith("data:") 
              ? "Uploaded file" 
              : (videoUrl || imageUrl)}
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
        
        {/* Preview */}
        {imageUrl && (
          <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border/30">
            <img 
              src={imageUrl} 
              alt="Background preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Preview</span>
            </div>
          </div>
        )}
        {videoUrl && (
          <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border/30">
            <video 
              src={videoUrl} 
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Preview</span>
            </div>
          </div>
        )}
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
          <span className="text-muted-foreground">Image</span>
        </button>
        <button
          onClick={() => setMode("video")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30 transition-all"
        >
          <Video className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Video</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-xl bg-card/30 border border-border/30 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === "video" ? (
            <Video className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Image className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            Add {mode === "video" ? "video" : "image"} background
          </span>
        </div>
        
        {/* Toggle between URL and file */}
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/30">
          <button
            onClick={() => setInputType("url")}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              inputType === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <Link className="w-3 h-3" />
          </button>
          <button
            onClick={() => setInputType("file")}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              inputType === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <Upload className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {inputType === "url" ? (
        <Input
          type="url"
          placeholder={mode === "video" ? "Video URL (MP4, WebM)" : "Image URL (JPG, PNG, GIF)"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-secondary/50 border-border/50"
        />
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === "video" ? "video/*" : "image/*"}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
          >
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {inputValue ? "File selected" : `Upload ${mode}`}
            </span>
          </button>
        </div>
      )}
      
      {/* Preview when file/url is selected */}
      {inputValue && (
        <div className="relative w-full h-20 rounded-lg overflow-hidden border border-border/30">
          {mode === "image" ? (
            <img src={inputValue} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <video src={inputValue} muted autoPlay loop playsInline className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-background/40" />
        </div>
      )}
      
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
            setInputType("url");
          }}
        >
          Cancel
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground/60">
        {inputType === "url" 
          ? "Use a direct link to an image or video file"
          : "Upload from your device (stored locally)"}
      </p>
    </div>
  );
};

export default BackgroundInput;
