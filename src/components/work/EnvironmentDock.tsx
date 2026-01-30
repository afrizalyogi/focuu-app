import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Music,
  Palette,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import ThemePicker from "./ThemePicker";
import MusicInput from "./MusicInput";
import BackgroundInput from "./BackgroundInput";
import LiveFocusChat from "./LiveFocusChat";
import { cn } from "@/lib/utils";

interface EnvironmentDockProps {
  preferences: any;
  setTheme: (theme: string) => void;
  setMusicUrl: (url: string) => void;
  setBackgroundUrl: (url: string, type: "image" | "video" | "none") => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

const EnvironmentDock = ({
  preferences,
  setTheme,
  setMusicUrl,
  setBackgroundUrl,
  isPro,
  onUpgradeClick,
}: EnvironmentDockProps) => {
  // We use separate Sheets/Popovers for each control to keep the UI clean
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const dockItems = [
    {
      id: "theme",
      icon: Palette,
      label: "Theme",
      content: (
        <div className="py-4">
          <ThemePicker
            value={preferences.theme}
            onChange={setTheme}
            showPreview
          />
        </div>
      ),
    },
    {
      id: "music",
      icon: Music,
      label: "Music",
      content: (
        <div className="py-4">
          <MusicInput
            value={preferences.musicUrl}
            title={preferences.musicTitle}
            onChange={setMusicUrl}
            isPro={isPro}
            onUpgradeClick={onUpgradeClick}
          />
        </div>
      ),
    },
    {
      id: "background",
      icon: ImageIcon,
      label: "Background",
      content: (
        <div className="py-4">
          <BackgroundInput
            imageUrl={
              preferences.backgroundType === "image"
                ? preferences.backgroundUrl
                : ""
            }
            videoUrl={
              preferences.backgroundType === "video"
                ? preferences.backgroundUrl
                : ""
            }
            onImageChange={(url) =>
              setBackgroundUrl(url, url ? "image" : "none")
            }
            onVideoChange={(url) =>
              setBackgroundUrl(url, url ? "video" : "none")
            }
            isPro={isPro}
            onUpgradeClick={onUpgradeClick}
          />
        </div>
      ),
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Live Chat",
      content: (
        <div className="h-[400px]">
          <LiveFocusChat isPro={isPro} onUpgradeClick={onUpgradeClick} />
        </div>
      ),
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-xl border border-border/40 shadow-2xl rounded-full">
        <TooltipProvider>
          {dockItems.map((item) => (
            <Sheet key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-12 h-12 transition-all duration-300 hover:scale-110 hover:bg-primary/10",
                        activeSheet === item.id
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
              <SheetContent
                side="bottom"
                className="h-[auto] max-h-[80vh] rounded-t-3xl"
              >
                <SheetHeader>
                  <SheetTitle>{item.label}</SheetTitle>
                </SheetHeader>
                {item.content}
              </SheetContent>
            </Sheet>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default EnvironmentDock;
