import { useEffect, useRef, useCallback } from "react";

// Random usernames to make messages feel real
const USERNAMES = [
  "focused_dev", "quiet_writer", "study_owl", "morning_coder", 
  "night_worker", "calm_student", "deep_thinker", "steady_pace",
  "flow_seeker", "task_master", "zen_worker", "silent_grind"
];

// Messages categorized by tone to match onboarding
const ENCOURAGING_MESSAGES = {
  general: [
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
  ],
  solidarity: [
    "We're all in this together.",
    "Someone else just started their session too.",
    "You're not the only one working right now.",
    "There are others grinding alongside you.",
    "The room is quiet, but full.",
    "Silent solidarity. Keep going.",
    "Others are pushing through too.",
    "You've got company in this.",
    "The focus room is alive.",
    "We work in silence, together.",
  ],
  timeAware: [
    "Great time to lock in.",
    "Perfect moment for deep work.",
    "This hour belongs to you.",
    "Make this session count.",
    "You chose this time. Own it.",
  ]
};

interface UseRandomChatOptions {
  enabled: boolean;
  onNewMessage: (message: { id: string; message: string; created_at: string; username?: string }) => void;
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
  const usedMessagesRef = useRef<Set<string>>(new Set());

  const getRandomMessage = useCallback(() => {
    // Combine all message types
    const allMessages = [
      ...ENCOURAGING_MESSAGES.general,
      ...ENCOURAGING_MESSAGES.solidarity,
      ...ENCOURAGING_MESSAGES.timeAware,
    ];
    
    // Reset if all messages have been used
    if (usedMessagesRef.current.size >= allMessages.length) {
      usedMessagesRef.current.clear();
    }

    let message: string;
    do {
      const index = Math.floor(Math.random() * allMessages.length);
      message = allMessages[index];
    } while (usedMessagesRef.current.has(message));

    usedMessagesRef.current.add(message);
    return message;
  }, []);

  const getRandomUsername = useCallback(() => {
    return USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
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
        username: getRandomUsername(),
        created_at: now.toISOString(),
      });

      scheduleNextMessage();
    }, interval);
  }, [enabled, getRandomInterval, getRandomMessage, getRandomUsername, onNewMessage]);

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
          username: getRandomUsername(),
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
  }, [enabled, scheduleNextMessage, getRandomMessage, getRandomUsername, onNewMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};
