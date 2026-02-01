import { Button } from "@/components/ui/button";
import { AppWindow, Play, Pause, Square } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import SessionTimerDisplay from "@/components/session/SessionTimerDisplay";

interface DocumentPiPButtonProps {
  formattedTime: string;
  isRunning: boolean;
  progress: number;
  timerType: "countdown" | "stopwatch";
  isOnBreak: boolean;
  activeTaskText?: string;
  onTogglePause: () => void;
  onStop: () => void;
}

const DocumentPiPButton = ({
  formattedTime,
  isRunning,
  progress,
  timerType,
  isOnBreak,
  activeTaskText,
  onTogglePause,
  onStop,
}: DocumentPiPButtonProps) => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const togglePiP = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if (!("documentPictureInPicture" in window)) {
      alert(
        "Picture-in-Picture is not supported in this browser. Try Chrome/Edge.",
      );
      return;
    }

    try {
      // @ts-expect-error - Document Picture-in-Picture API is not yet in TypeScript definitions
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 300,
        height: 300,
      });

      // Copy styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = styleSheet.type;
            link.href = styleSheet.href;
            pipWindow.document.head.appendChild(link);
          } else {
            const css = [...styleSheet.cssRules].map((r) => r.cssText).join("");
            const style = document.createElement("style");
            style.textContent = css;
            pipWindow.document.head.appendChild(style);
          }
        } catch (e) {
          console.log("Error copying style", e);
        }
      });

      pipWindow.addEventListener("pagehide", () => {
        setPipWindow(null);
      });

      setPipWindow(pipWindow);
    } catch (error) {
      console.error("Failed to open PiP window:", error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePiP}
        title="Picture in Picture Mode"
        className="w-14 h-14 rounded-full border border-border/30 bg-card/20 hover:bg-card/40 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
      >
        <AppWindow className="w-6 h-6" />
      </Button>

      {pipWindow &&
        createPortal(
          <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 select-none overflow-hidden">
            {activeTaskText && (
              <p className="text-xs font-medium text-muted-foreground mb-6 text-center line-clamp-2 px-2 uppercase tracking-wider">
                Current Focus
                <br />
                <span className="text-foreground text-sm normal-case">
                  {activeTaskText}
                </span>
              </p>
            )}

            <div className="scale-90 origin-center mb-6">
              <SessionTimerDisplay
                formattedTime={formattedTime}
                isRunning={isRunning}
                progress={progress}
                timerType={timerType}
                isOnBreak={isOnBreak}
              />
            </div>

            {/* Controls in PiP */}
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="outline"
                onClick={onTogglePause}
                className="w-12 h-12 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-1" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  onStop();
                  pipWindow.close();
                }}
                className="w-12 h-12 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <Square className="w-5 h-5" />
              </Button>
            </div>
          </div>,
          pipWindow.document.body,
        )}
    </>
  );
};

export default DocumentPiPButton;
