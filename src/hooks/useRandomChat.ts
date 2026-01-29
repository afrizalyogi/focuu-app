import { useEffect, useRef, useCallback } from "react";

const ENCOURAGING_MESSAGES = [
  "You're doing great. Keep going.",
  "One step at a time.",
  "Stay with it. You got this.",
  "Deep breath. Then continue.",
  "Almost there. Stay focused.",
  "Good work. Keep the momentum.",
  "You showed up. That matters.",
  "Focus in, world out.",
  "This is your time. Use it well.",
  "Small progress is still progress.",
  "Don't rush. Just work.",
  "You're not alone in this.",
  "Keep going. The work matters.",
  "Trust the process.",
  "One thing at a time.",
  "Stay present. Stay calm.",
  "Your effort counts.",
  "Keep at it. Break soon.",
  "Breathe. Then focus.",
  "You're building something.",
  "Steady wins the race.",
  "This moment counts.",
  "Keep showing up.",
  "Almost done with this one.",
  "Take it easy, but take it.",
  "Quiet focus. Good work.",
  "Let the work flow.",
  "You're in the zone.",
  "Stay with the task.",
  "Progress, not perfection.",
];

interface UseRandomChatOptions {
  enabled: boolean;
  onNewMessage: (message: { id: string; message: string; created_at: string }) => void;
  minInterval?: number;
  maxInterval?: number;
}

export const useRandomChat = ({
  enabled,
  onNewMessage,
  minInterval = 20000,
  maxInterval = 80000,
}: UseRandomChatOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const usedMessagesRef = useRef<Set<number>>(new Set());

  const getRandomMessage = useCallback(() => {
    // Reset if all messages have been used
    if (usedMessagesRef.current.size >= ENCOURAGING_MESSAGES.length) {
      usedMessagesRef.current.clear();
    }

    let index: number;
    do {
      index = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
    } while (usedMessagesRef.current.has(index));

    usedMessagesRef.current.add(index);
    return ENCOURAGING_MESSAGES[index];
  }, []);

  const getRandomInterval = useCallback(() => {
    return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  }, [minInterval, maxInterval]);

  const scheduleNextMessage = useCallback(() => {
    if (!enabled) return;

    const interval = getRandomInterval();
    
    timeoutRef.current = setTimeout(() => {
      const message = getRandomMessage();
      const now = new Date();
      
      onNewMessage({
        id: `random-${Date.now()}`,
        message,
        created_at: now.toISOString(),
      });

      scheduleNextMessage();
    }, interval);
  }, [enabled, getRandomInterval, getRandomMessage, onNewMessage]);

  useEffect(() => {
    if (enabled) {
      // Start with a shorter initial delay (5-15 seconds)
      const initialDelay = Math.floor(Math.random() * 10000) + 5000;
      
      timeoutRef.current = setTimeout(() => {
        const message = getRandomMessage();
        const now = new Date();
        
        onNewMessage({
          id: `random-${Date.now()}`,
          message,
          created_at: now.toISOString(),
        });

        scheduleNextMessage();
      }, initialDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, scheduleNextMessage, getRandomMessage, onNewMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};
