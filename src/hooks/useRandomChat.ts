import { useEffect, useRef, useCallback } from "react";

// Realistic usernames
const USERNAMES = [
  "Alex Dev",
  "SarahDesign",
  "Mike Code",
  "Emma Writes",
  "David P",
  "Jessica S",
  "Ryan Focus",
  "Kate Working",
  "Daniel M",
  "Sophie Study",
  "Chris Builds",
  "Olivia Reads",
  "Nathan Tech",
  "Grace Flow",
  "Tom Create",
  "Lily Notes",
];

// Messages categorized by tone
const ENCOURAGING_MESSAGES = {
  general: [
    "you're doing great, keep going.",
    "one step at a time.",
    "stay with it, you got this.",
    "deep breath, then continue.",
    "almost there, stay focused.",
    "good work, keep the momentum.",
    "you showed up, that matters.",
    "focus in, world out.",
    "this is your time, use it well.",
    "small progress is still progress.",
    "don't rush, just work.",
    "you're not alone in this.",
    "keep going, the work matters.",
    "trust the process.",
    "one thing at a time.",
    "stay present, stay calm.",
    "your effort counts.",
    "keep at it, break soon.",
    "breathe, then focus.",
    "you're building something.",
    "steady wins the race.",
    "this moment counts.",
    "keep showing up.",
    "almost done with this one.",
    "take it easy, but take it.",
    "quiet focus, good work.",
    "let the work flow.",
    "you're in the zone.",
    "stay with the task.",
    "progress, not perfection.",
  ],
  solidarity: [
    "we're all in this together.",
    "someone else just started their session too.",
    "you're not the only one working right now.",
    "there are others grinding alongside you.",
    "the room is quiet, but full.",
    "silent solidarity, keep going.",
    "others are pushing through too.",
    "you've got company in this.",
    "the focus room is alive.",
    "we work in silence, together.",
  ],
  timeAware: [
    "great time to lock in.",
    "perfect moment for deep work.",
    "this hour belongs to you.",
    "make this session count.",
    "you chose this time, own it.",
    "the clock is ticking, make it yours.",
    "seconds turning into progress.",
    "don't watch the clock, do what it does.",
    "time is your resource.",
  ],
  mindfulness: [
    "notice your breath.",
    "relax your shoulders.",
    "unclench your jaw.",
    "be here, now.",
    "let go of the distraction.",
    "calm mind, steady work.",
    "find your rhythm.",
    "gentle focus.",
    "peace in the process.",
    "just this task.",
    "observe, then act.",
    "clarity comes with calm.",
    "soften your gaze.",
    "ground yourself.",
    "reset your attention.",
    "breathe in focus.",
    "exhale stress.",
    "mindful motion.",
    "center your thoughts.",
    "present moment awareness.",
  ],
  validation: [
    "it's okay to find this hard.",
    "struggle means you're trying.",
    "showing up is the hard part.",
    "be proud of this effort.",
    "you're doing enough.",
    "this works matters.",
    "your discipline is growing.",
    "hard work pays off.",
    "believe in your capacity.",
    "you are capable.",
    "resilience is built now.",
    "every session counts.",
    "you're building a habit.",
    "give yourself credit.",
    "keep pushing, gently.",
  ],
  productivity: [
    "momentum is building.",
    "one task, one step.",
    "action creates motivation.",
    "focus is a muscle.",
    "train your attention.",
    "deep work, deep rewards.",
    "efficiency is key.",
    "eliminate the noise.",
    "laser focus engaged.",
    "flow state incoming.",
    "build the future now.",
    "create, don't consume.",
    "output over input.",
    "mastery takes time.",
    "excellence is a habit.",
  ],
};

interface UseRandomChatOptions {
  enabled: boolean;
  onNewMessage: (message: {
    id: string;
    message: string;
    created_at: string;
    username?: string;
  }) => void;
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
      ...ENCOURAGING_MESSAGES.mindfulness,
      ...ENCOURAGING_MESSAGES.validation,
      ...ENCOURAGING_MESSAGES.productivity,
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
    return (
      Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval
    );
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
  }, [
    enabled,
    getRandomInterval,
    getRandomMessage,
    getRandomUsername,
    onNewMessage,
  ]);

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
  }, [
    enabled,
    scheduleNextMessage,
    getRandomMessage,
    getRandomUsername,
    onNewMessage,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};
