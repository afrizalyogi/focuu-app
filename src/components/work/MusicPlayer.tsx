import { useState, useRef, useEffect, useCallback } from "react";
import { Disc3, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  url: string;
  isMinimized?: boolean;
  onClose?: () => void;
}

// Extract audio URL from various sources
const extractAudioUrl = (url: string): { type: "direct" | "youtube" | "spotify" | "unsupported"; id?: string } => {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return { type: "youtube", id: ytMatch[1] };
  }
  
  // Spotify
  const spotifyMatch = url.match(/spotify\.com\/(?:track|playlist|album)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    return { type: "spotify", id: spotifyMatch[1] };
  }
  
  // Direct audio file
  if (url.match(/\.(mp3|wav|ogg|m4a|flac)$/i) || url.includes("audio")) {
    return { type: "direct" };
  }
  
  // Try as direct URL anyway
  return { type: "direct" };
};

const MusicPlayer = ({ url, isMinimized = false, onClose }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const urlInfo = extractAudioUrl(url);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError("Unable to load audio");
      setIsLoading(false);
    };
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // For YouTube/Spotify, show external player message
  if (urlInfo.type === "youtube" || urlInfo.type === "spotify") {
    return (
      <div className={cn(
        "rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30 p-4",
        isMinimized && "p-2"
      )}>
        <div className="flex items-center gap-4">
          {/* Spinning disc */}
          <div className={cn(
            "relative flex-shrink-0",
            isMinimized ? "w-8 h-8" : "w-16 h-16"
          )}>
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10",
              isPlaying && "animate-spin"
            )} style={{ animationDuration: "3s" }}>
              <Disc3 className="w-full h-full text-primary/50" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {urlInfo.type === "youtube" ? "YouTube" : "Spotify"} audio
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Open in new tab to play
            </p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              Open player →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30",
      isMinimized ? "p-3" : "p-4"
    )}>
      <audio ref={audioRef} src={url} preload="metadata" />
      
      <div className="flex items-center gap-4">
        {/* Spinning disc */}
        <div className={cn(
          "relative flex-shrink-0",
          isMinimized ? "w-10 h-10" : "w-16 h-16"
        )}>
          <div 
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center",
              isPlaying && "animate-spin"
            )} 
            style={{ animationDuration: "3s" }}
          >
            <Disc3 className={cn(
              "text-primary/60",
              isMinimized ? "w-8 h-8" : "w-12 h-12"
            )} />
          </div>
          <div className={cn(
            "absolute rounded-full bg-background",
            isMinimized ? "inset-[35%]" : "inset-[30%]"
          )} />
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Timeline */}
          {!isMinimized && (
            <div className="space-y-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={isLoading || !!error}
              />
              <div className="flex justify-between text-xs text-muted-foreground/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={isLoading || !!error}
              className={cn(
                "p-2 rounded-full transition-colors",
                "bg-primary/10 hover:bg-primary/20 text-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isPlaying ? (
                <Pause className={isMinimized ? "w-4 h-4" : "w-5 h-5"} />
              ) : (
                <Play className={isMinimized ? "w-4 h-4" : "w-5 h-5"} />
              )}
            </button>
            
            {!isMinimized && (
              <>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </>
            )}
          </div>
          
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
