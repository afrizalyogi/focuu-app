import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatMessage } from "@/hooks/useLiveChat";

interface ChatNotificationBubbleProps {
  message: ChatMessage | null;
  onClear: () => void;
  onOpenChat: () => void;
}

const ChatNotificationBubble = ({
  message,
  onClear,
  onOpenChat,
}: ChatNotificationBubbleProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Reset timer whenever message changes
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Add a small delay for animation before clearing
        setTimeout(onClear, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message || !isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up origin-bottom w-[90vw] md:w-auto">
      <div
        className="flex items-start gap-3 p-3 md:p-4 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/20 shadow-2xl w-full md:max-w-xs cursor-pointer hover:scale-105 transition-transform duration-200 group"
        onClick={() => {
          onOpenChat();
          setIsVisible(false);
          onClear();
        }}
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-4 justify-between mb-0.5 md:mb-1">
            <p className="text-xs md:text-sm text-primary font-medium truncate">
              {message.username || "User"}
            </p>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              Just now
            </span>
          </div>
          <p className="text-xs md:text-sm text-foreground/90 line-clamp-2 leading-relaxed">
            {message.message}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            onClear();
          }}
          className="text-muted-foreground hover:text-foreground transition-colors -mt-1 -mr-1 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatNotificationBubble;
