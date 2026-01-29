import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type EventType = 
  | "page_view"
  | "session_start"
  | "session_end"
  | "session_pause"
  | "session_resume"
  | "task_create"
  | "task_complete"
  | "chat_message"
  | "theme_change"
  | "music_play"
  | "music_pause"
  | "fullscreen_toggle"
  | "onboarding_step"
  | "onboarding_complete"
  | "upgrade_prompt_view"
  | "upgrade_click"
  | "feature_discovery"
  | "error";

interface AnalyticsEvent {
  eventType: EventType;
  eventData?: Record<string, any>;
  page?: string;
}

const LOCAL_ANALYTICS_KEY = "focuu_analytics_queue";

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = useCallback(async (event: AnalyticsEvent) => {
    const sessionId = getSessionId();
    const page = event.page || (typeof window !== "undefined" ? window.location.pathname : "");

    const analyticsData = {
      event_type: event.eventType,
      event_data: event.eventData || {},
      session_id: sessionId,
      page,
      user_id: user?.id || null,
    };

    if (user) {
      // Save to Supabase
      await supabase.from("user_analytics").insert(analyticsData);
    } else {
      // Queue locally for anonymous users
      const queue = getLocalQueue();
      queue.push({ ...analyticsData, created_at: new Date().toISOString() });
      
      // Keep only last 100 events
      if (queue.length > 100) {
        queue.shift();
      }
      
      localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(queue));
    }
  }, [user]);

  // Sync local queue when user logs in
  const syncLocalQueue = useCallback(async () => {
    if (!user) return;

    const queue = getLocalQueue();
    if (queue.length === 0) return;

    // Batch insert
    const withUserId = queue.map((event) => ({
      ...event,
      user_id: user.id,
    }));

    await supabase.from("user_analytics").insert(withUserId);
    localStorage.removeItem(LOCAL_ANALYTICS_KEY);
  }, [user]);

  // Track page view
  const trackPageView = useCallback((page: string) => {
    track({ eventType: "page_view", page });
  }, [track]);

  // Track session events
  const trackSessionStart = useCallback((data?: Record<string, any>) => {
    track({ eventType: "session_start", eventData: data });
  }, [track]);

  const trackSessionEnd = useCallback((data?: Record<string, any>) => {
    track({ eventType: "session_end", eventData: data });
  }, [track]);

  // Track feature usage
  const trackFeatureDiscovery = useCallback((feature: string) => {
    track({ eventType: "feature_discovery", eventData: { feature } });
  }, [track]);

  // Track onboarding
  const trackOnboardingStep = useCallback((step: number, data?: Record<string, any>) => {
    track({ eventType: "onboarding_step", eventData: { step, ...data } });
  }, [track]);

  const trackOnboardingComplete = useCallback((data?: Record<string, any>) => {
    track({ eventType: "onboarding_complete", eventData: data });
  }, [track]);

  return {
    track,
    syncLocalQueue,
    trackPageView,
    trackSessionStart,
    trackSessionEnd,
    trackFeatureDiscovery,
    trackOnboardingStep,
    trackOnboardingComplete,
  };
};

// Session ID management
function getSessionId(): string {
  const key = "focuu_session_id";
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

function getLocalQueue(): any[] {
  const stored = localStorage.getItem(LOCAL_ANALYTICS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}
