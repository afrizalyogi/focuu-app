import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const PRESENCE_CHANNEL = "focuu:presence";

export const usePresenceCount = () => {
  const [count, setCount] = useState(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create presence channel
    const presenceChannel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: crypto.randomUUID(),
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const totalCount = Object.keys(state).length;
        setCount(totalCount);
      })
      .on("presence", { event: "join" }, () => {
        const state = presenceChannel.presenceState();
        setCount(Object.keys(state).length);
      })
      .on("presence", { event: "leave" }, () => {
        const state = presenceChannel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track this user's presence
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, []);

  return count;
};

// Hook for tracking presence when actively working
export const useWorkingPresence = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const startTracking = useCallback(async () => {
    if (channel) return;

    const workingChannel = supabase.channel("focuu:working", {
      config: {
        presence: {
          key: crypto.randomUUID(),
        },
      },
    });

    await workingChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await workingChannel.track({
          started_at: new Date().toISOString(),
        });
        setIsTracking(true);
      }
    });

    setChannel(workingChannel);
  }, [channel]);

  const stopTracking = useCallback(async () => {
    if (channel) {
      await channel.untrack();
      await channel.unsubscribe();
      setChannel(null);
      setIsTracking(false);
    }
  }, [channel]);

  useEffect(() => {
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [channel]);

  return { isTracking, startTracking, stopTracking };
};
