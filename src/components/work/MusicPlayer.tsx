import { useState, useRef, useEffect, useCallback } from "react";
import { Disc3, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Extract audio URL from various sources
const extractAudioUrl = (
  url: string,
): { type: "direct" | "youtube" | "spotify" | "unsupported"; id?: string } => {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) {
    return { type: "youtube", id: ytMatch[1] };
  }

  // Spotify
  const spotifyMatch = url.match(
    /spotify\.com\/(?:track|playlist|album)\/([a-zA-Z0-9]+)/,
  );
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

interface MusicPlayerProps {
  url: string;
  title?: string;
  isMinimized?: boolean;
  onClose?: () => void;
  autoPlay?: boolean;
}

const MusicPlayer = ({
  url,
  title,
  isMinimized = false,
  onClose,
  autoPlay = false,
}: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAutoPlayed = useRef(false);

  const urlInfo = extractAudioUrl(url);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || urlInfo.type !== "direct") return;

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
  }, [urlInfo.type]);

  // Auto-play when autoPlay prop is true (for direct audio)
  useEffect(() => {
    if (
      autoPlay &&
      audioRef.current &&
      !hasAutoPlayed.current &&
      !isLoading &&
      !error &&
      urlInfo.type === "direct"
    ) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          hasAutoPlayed.current = true;
        })
        .catch(() => {
          console.log("Auto-play prevented by browser");
        });
    }
  }, [autoPlay, isLoading, error, urlInfo.type]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (urlInfo.type === "direct" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, urlInfo.type]);

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

  // YouTube embed player (audio only - hidden video)
  if (urlInfo.type === "youtube" && urlInfo.id) {
    const embedUrl = `https://www.youtube.com/embed/${urlInfo.id}?autoplay=${autoPlay ? 1 : 0}&loop=1&playlist=${urlInfo.id}&controls=0&modestbranding=1&rel=0&showinfo=0`;

    return (
      <div
        className={cn(
          "rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30",
          isMinimized ? "p-3" : "p-4",
        )}
      >
        {/* Hidden YouTube iframe */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="hidden"
          allow="autoplay; encrypted-media"
          title="YouTube audio player"
        />

        <div className="flex items-center gap-4">
          {/* Always spinning disc - black/white */}
          <div
            className={cn(
              "relative flex-shrink-0",
              isMinimized ? "w-10 h-10" : "w-16 h-16",
            )}
          >
            <div
              className="absolute inset-0 rounded-full bg-black flex items-center justify-center animate-spin"
              style={{ animationDuration: "3s" }}
            >
              <Disc3
                className={cn(
                  "text-white",
                  isMinimized ? "w-8 h-8" : "w-12 h-12",
                )}
              />
            </div>
            <div
              className={cn(
                "absolute rounded-full bg-white",
                isMinimized ? "inset-[40%]" : "inset-[35%]",
              )}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-xs font-medium text-foreground truncate">
              {title || "YouTube Audio"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Playing in background
            </p>

            {/* Simple indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                <span
                  className="w-1 h-4 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-1 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="w-1 h-5 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                />
                <span
                  className="w-1 h-3 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <span className="text-xs text-muted-foreground/60">
                Streaming
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Spotify embed player
  if (urlInfo.type === "spotify" && urlInfo.id) {
    // Determine if it's a track, playlist, or album
    const spotifyType = url.includes("/track/")
      ? "track"
      : url.includes("/playlist/")
        ? "playlist"
        : "album";
    const embedUrl = `https://open.spotify.com/embed/${spotifyType}/${urlInfo.id}?utm_source=generator&theme=0`;

    return (
      <div
        className={cn(
          "rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30 overflow-hidden",
          isMinimized ? "p-2" : "",
        )}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Always spinning disc - black/white */}
          <div
            className={cn(
              "relative flex-shrink-0",
              isMinimized ? "w-10 h-10" : "w-12 h-12",
            )}
          >
            <div
              className="absolute inset-0 rounded-full bg-black flex items-center justify-center animate-spin"
              style={{ animationDuration: "3s" }}
            >
              <Disc3 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute rounded-full bg-white inset-[35%]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {title || "Spotify Player"}
            </p>
            <p className="text-xs text-muted-foreground/60">
              Use controls below
            </p>
          </div>
        </div>

        {/* Spotify embed - compact player */}
        {!isMinimized && (
          <iframe
            src={embedUrl}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-b-xl"
          />
        )}
      </div>
    );
  }

  // Direct audio player
  return (
    <div
      className={cn(
        "rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30",
        isMinimized ? "p-3" : "p-4",
      )}
    >
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Always spinning disc - black/white */}
        <div
          className={cn(
            "relative flex-shrink-0",
            isMinimized ? "w-10 h-10" : "w-16 h-16",
          )}
        >
          <div
            className="absolute inset-0 rounded-full bg-black flex items-center justify-center animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <Disc3
              className={cn(
                "text-white",
                isMinimized ? "w-8 h-8" : "w-12 h-12",
              )}
            />
          </div>
          <div
            className={cn(
              "absolute rounded-full bg-white",
              isMinimized ? "inset-[40%]" : "inset-[35%]",
            )}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Timeline */}
          {!isMinimized && (
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
                  {title || "Audio Track"}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={isLoading || !!error}
              />
            </div>
          )}

          {isMinimized && (
            <p className="text-xs font-medium text-foreground truncate">
              {title || "Audio Track"}
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={isLoading || !!error}
              className={cn(
                "p-2 rounded-full transition-colors",
                "bg-primary/10 hover:bg-primary/20 text-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed",
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

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
