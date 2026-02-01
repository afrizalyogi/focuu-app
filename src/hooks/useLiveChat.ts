import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRandomChat } from "@/hooks/useRandomChat";

export interface ChatMessage {
  id: string;
  user_id?: string;
  message: string;
  created_at: string;
  username?: string;
}

export const useLiveChat = (enabled: boolean = true) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Notification state
  const [latestMessage, setLatestMessage] = useState<ChatMessage | null>(null);

  // Random chat message handler
  const handleRandomMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    // Only notify if it's not our own message (conceptually, though random ones aren't ours)
    setLatestMessage(msg);
  }, []);

  // Enable random chat hook
  useRandomChat({
    enabled: enabled,
    onNewMessage: handleRandomMessage,
    minInterval: 50000,
    maxInterval: 150000,
  });

  // Fetch initial messages
  useEffect(() => {
    if (!enabled) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [enabled]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("global_chat_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);

          // Show notification if it's not from us
          if (newMsg.user_id !== user?.id) {
            setLatestMessage(newMsg);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, user]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) return;

    const messageText = text.trim().slice(0, 140);

    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      message: messageText,
      username: profile?.display_name || user.email?.split("@")[0] || "User",
    });

    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const clearNotification = () => setLatestMessage(null);

  return {
    messages,
    sendMessage,
    isLoading,
    latestMessage,
    clearNotification,
  };
};
