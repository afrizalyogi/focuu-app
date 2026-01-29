import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startedAt: string | null;
  endsAt: string | null;
}

export const useTrial = () => {
  const { user, profile } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isActive: false,
    daysRemaining: 0,
    startedAt: null,
    endsAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check trial status
  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Get profile with trial info
      const { data, error } = await supabase
        .from("profiles")
        .select("trial_started_at, trial_ends_at, subscription_status, is_pro")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        const now = new Date();
        const endsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
        const isActive = endsAt ? endsAt > now : false;
        const daysRemaining = endsAt 
          ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        setTrialStatus({
          isActive,
          daysRemaining,
          startedAt: data.trial_started_at,
          endsAt: data.trial_ends_at,
        });
      }

      setIsLoading(false);
    };

    checkTrialStatus();
  }, [user]);

  // Start trial for new user
  const startTrial = useCallback(async () => {
    if (!user) return false;

    const { data, error } = await supabase.rpc("start_trial", {
      user_id: user.id,
    });

    if (!error && data) {
      const now = new Date();
      const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day

      setTrialStatus({
        isActive: true,
        daysRemaining: 1,
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
      });

      return true;
    }

    return false;
  }, [user]);

  // Check if user has Pro access (either Pro subscription or active trial)
  const hasProAccess = profile?.is_pro || trialStatus.isActive;

  return {
    trialStatus,
    isLoading,
    startTrial,
    hasProAccess,
    isPro: profile?.is_pro ?? false,
    isTrial: trialStatus.isActive && !profile?.is_pro,
  };
};
