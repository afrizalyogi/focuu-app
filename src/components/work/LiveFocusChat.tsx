import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Add Button import
import { Send } from "lucide-react"; // Add Send icon import
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useLiveChat";

interface LiveFocusChatProps {
  isPro: boolean;
  onUpgradeClick: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

const LiveFocusChat = ({
  isPro,
  onUpgradeClick,
  messages,
  sendMessage,
  isLoading,
}: LiveFocusChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !isPro) return;

    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full space-y-3 p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Focus Room
        </p>
        {!isPro && (
          <p className="text-xs text-muted-foreground/60">
            Others are working too.
          </p>
        )}
      </div>

      {/* Chat area */}
      <div className="relative">
        <div
          className={cn(
            "h-[140px] overflow-y-auto rounded-xl bg-secondary/30 border border-border/30 p-3 space-y-2",
            !isPro && "blur-[2px]",
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-muted-foreground/60">
                No messages yet. Be the first to encourage!
              </span>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="text-sm text-foreground/80">
                <span className="text-muted-foreground/40 text-xs mr-2">
                  {formatTime(msg.created_at)}
                </span>
                {msg.username && (
                  <span className="text-muted-foreground/60 text-xs mr-1">
                    {msg.username}:
                  </span>
                )}
                {msg.message}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Overlay for free users */}
        {!isPro && (
          <div
            onClick={onUpgradeClick}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group bg-background/20 rounded-xl"
          >
            <p className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-calm px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm">
              Quiet encouragement happens here →
            </p>
          </div>
        )}
      </div>

      {/* Input for Pro users */}
      {isPro ? (
        <div className="relative flex items-center gap-2">
          <Input
            type="text"
            placeholder="Encourage, don't distract..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, 140))}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-secondary/50 border border-border/50 focus-visible:ring-1 focus-visible:ring-primary pr-16"
          />
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">
            {newMessage.length}/140
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={onUpgradeClick}
          className="p-2 rounded-xl bg-secondary/30 border border-border/30 text-center cursor-pointer group"
        >
          <p className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground transition-calm">
            Join the room with Pro
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveFocusChat;
