import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  CheckSquare,
} from "lucide-react";
import ThemePicker from "./ThemePicker";
import MusicInput from "./MusicInput";
import BackgroundInput from "./BackgroundInput";
import LiveFocusChat from "./LiveFocusChat";
import TaskPlanner from "./TaskPlanner";
import { cn } from "@/lib/utils";

interface EnvironmentDockProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences: any;
  setTheme: (theme: string) => void;
  setMusicUrl: (url: string) => void;
  setBackgroundUrl: (url: string, type: "image" | "video" | "none") => void;
  isPro: boolean;
  onUpgradeClick: () => void;
  // Tasks props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks?: any[];
  onAddTask?: (text: string) => void;
  onToggleTask?: (id: string) => void;
  onRemoveTask?: (id: string) => void;
  // Controlled state
  activeSheet: string | null;
  onOpenChange: (sheet: string | null) => void;
  // Chat props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chatMessages: any[];
  onSendMessage: (text: string) => Promise<void>;
  isChatLoading: boolean;
  isChatNotificationsEnabled: boolean;
  onToggleChatNotifications: (enabled: boolean) => void;
}

const EnvironmentDock = ({
  preferences,
  setTheme,
  setMusicUrl,
  setBackgroundUrl,
  isPro,
  onUpgradeClick,
  tasks,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  activeSheet,
  onOpenChange,
  chatMessages,
  onSendMessage,
  isChatLoading,
  isChatNotificationsEnabled,
  onToggleChatNotifications,
}: EnvironmentDockProps) => {
  const { user } = useAuth();

  // We use separate Sheets/Popovers for each control to keep the UI clean
  // We use separate Sheets/Popovers for each control to keep the UI clean

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
        <div className="h-[260px]">
          <LiveFocusChat
            isPro={isPro}
            onUpgradeClick={onUpgradeClick}
            messages={chatMessages}
            sendMessage={onSendMessage}
            isLoading={isChatLoading}
          />
        </div>
      ),
    },
    {
      id: "tasks",
      icon: CheckSquare,
      label: "Tasks",
      content: (
        <div className="h-[400px]">
          <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-medium mb-4">Focus Tasks</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a new task..."
                className="flex-1 bg-secondary/50 border-border/50 rounded-lg px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    if (val.trim()) {
                      onAddTask?.(val.trim());
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {tasks?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-10">
                  No tasks yet.
                </p>
              ) : (
                tasks?.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/30"
                  >
                    <button
                      onClick={() => onToggleTask?.(task.id)}
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                        task.isActive
                          ? "border-primary bg-primary/20"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {task.isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        task.isActive && "text-primary font-medium",
                      )}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => onRemoveTask?.(task.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <span className="sr-only">Delete</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-6 mx-auto flex items-center -translate-x-1/2 z-50 animate-fade-up">
      <div className="flex items-center gap-2 p-2 bg-card/60 backdrop-blur-xl border border-border/10 shadow-2xl rounded-full">
        <TooltipProvider>
          {dockItems.map((item) => (
            <Sheet
              key={item.id}
              open={activeSheet === item.id}
              onOpenChange={(open) => {
                if (open) {
                  onOpenChange(item.id);
                } else {
                  onOpenChange(null);
                }
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button
                      id={`dock-${item.id}`}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-12 h-12 transition-all duration-300 hover:scale-110 hover:bg-accent hover:shadow-sm",
                        activeSheet === item.id
                          ? "bg-primary/20 text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5" />
                      </div>
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
                <SheetHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
                  <SheetTitle>{item.label}</SheetTitle>
                  {item.id === "chat" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Bubbles
                      </span>
                      <div
                        className={cn(
                          "w-8 h-4 rounded-full transition-colors cursor-pointer relative",
                          isChatNotificationsEnabled
                            ? "bg-primary"
                            : "bg-muted",
                        )}
                        onClick={() =>
                          onToggleChatNotifications(!isChatNotificationsEnabled)
                        }
                      >
                        <div
                          className={cn(
                            "absolute top-0.5 bottom-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                            isChatNotificationsEnabled
                              ? "left-4.5"
                              : "left-0.5",
                          )}
                          style={{
                            left: isChatNotificationsEnabled ? "18px" : "2px",
                          }}
                        />
                      </div>
                    </div>
                  )}
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
