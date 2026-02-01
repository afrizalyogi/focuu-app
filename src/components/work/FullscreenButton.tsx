import { Maximize, Minimize } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FullscreenButtonProps {
  className?: string;
  size?: "sm" | "md";
}

const FullscreenButton = ({
  className,
  size = "md",
}: FullscreenButtonProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  /* Matching DocumentPiPButton size (w-14 h-14 = 3.5rem) */
  const iconSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const buttonSize = size === "sm" ? "w-8 h-8" : "w-14 h-14";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      className={cn(
        buttonSize,
        "rounded-full border border-border/30 bg-card/20 backdrop-blur-sm",
        "hover:bg-card/40 hover:text-foreground transition-all",
        size !== "sm" && "text-muted-foreground", // Match PiP color
        className,
      )}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className={iconSize} />
      ) : (
        <Maximize className={iconSize} />
      )}
    </Button>
  );
};

export default FullscreenButton;
