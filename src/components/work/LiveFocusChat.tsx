import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface LiveFocusChatProps {
  isPro: boolean;
  onUpgradeClick: () => void;
}

// Mock messages for demo - in production these would come from Supabase realtime
const MOCK_MESSAGES: ChatMessage[] = [
  { id: "1", text: "Back to it.", timestamp: new Date(Date.now() - 300000), isSystem: true },
  { id: "2", text: "Taking a moment to breathe.", timestamp: new Date(Date.now() - 240000) },
  { id: "3", text: "Halfway through my session.", timestamp: new Date(Date.now() - 180000) },
  { id: "4", text: "Stay with this a bit longer.", timestamp: new Date(Date.now() - 120000), isSystem: true },
  { id: "5", text: "One thing at a time.", timestamp: new Date(Date.now() - 60000) },
];

const LiveFocusChat = ({ isPro, onUpgradeClick }: LiveFocusChatProps) => {
  const [messages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [canSend, setCanSend] = useState(true);

  // Slow mode: 1 message per 2 minutes
  const handleSend = () => {
    if (!newMessage.trim() || !canSend || !isPro) return;
    
    // In production: send to Supabase realtime channel
    console.log("Sending:", newMessage);
    setNewMessage("");
    setCanSend(false);
    
    // Re-enable after 2 minutes
    setTimeout(() => setCanSend(true), 120000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
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
            "h-[140px] overflow-y-auto rounded-lg bg-secondary/50 p-3 space-y-2",
            !isPro && "blur-[2px]"
          )}
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "text-sm",
                msg.isSystem ? "text-muted-foreground/60 italic" : "text-foreground/80"
              )}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Overlay for free users */}
        {!isPro && (
          <div 
            onClick={onUpgradeClick}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group bg-background/20 rounded-lg"
          >
            <p className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-calm backdrop-blur-none">
              Quiet encouragement happens here →
            </p>
          </div>
        )}
      </div>

      {/* Input for Pro users */}
      {isPro ? (
        <div className="relative">
          <Input
            type="text"
            placeholder={canSend ? "Encourage, don't distract..." : "Slow mode active..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, 140))}
            onKeyDown={handleKeyDown}
            disabled={!canSend}
            className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">
            {newMessage.length}/140
          </span>
        </div>
      ) : (
        <div 
          onClick={onUpgradeClick}
          className="p-2 rounded-lg bg-secondary/30 text-center cursor-pointer group"
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
