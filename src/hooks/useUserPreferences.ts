import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { encryptAndStore, retrieveAndDecrypt } from "@/utils/secureStorage";

interface UserPreferences {
  musicUrl: string;
  musicTitle: string;
  backgroundUrl: string;
  backgroundType: "image" | "video" | "none";
  theme: "dark" | "light" | "book";
}

const SECURE_PREFS_KEY = "focuu_secure_user_prefs_v1";

const defaultPrefs: UserPreferences = {
  musicUrl: "",
  musicTitle: "",
  backgroundUrl: "",
  backgroundType: "none",
  theme: "dark",
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPrefs);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);

      // 1. Try Secure Cache First
      const cached =
        await retrieveAndDecrypt<UserPreferences>(SECURE_PREFS_KEY);

      if (cached) {
        setPreferences(cached);
        // Apply theme immediately from cache
        if (cached.theme) {
          document.documentElement.classList.remove("dark", "light", "book");
          document.documentElement.classList.add(cached.theme);
        }
        setIsLoading(false);
        // We do NOT hit API if cache hits, per user request.
        // But if user changes device, this device won't know until cache expires (7 days).
        // For now, valid per specs.
        console.log("Loaded preferences from secure cache");
        return;
      }

      // 2. If no cache, fetch from DB
      if (user) {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          const dbPrefs: UserPreferences = {
            musicUrl: data.music_url || "",
            musicTitle: data.music_title || "",
            backgroundUrl: data.background_url || "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            backgroundType: (data.background_type as any) || "none",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            theme: (data.theme as any) || "dark",
          };

          setPreferences(dbPrefs);
          // Save to secure cache
          await encryptAndStore(SECURE_PREFS_KEY, dbPrefs);

          if (dbPrefs.theme) {
            document.documentElement.classList.remove("dark", "light", "book");
            document.documentElement.classList.add(dbPrefs.theme);
          }
        }
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const newPrefs = { ...preferences, ...updates };
      setPreferences(newPrefs);

      // 1. Update Cache Immediately
      await encryptAndStore(SECURE_PREFS_KEY, newPrefs);

      // 2. Update DB
      if (user) {
        const hasLargeFile = newPrefs.backgroundUrl?.startsWith("data:");
        // Avoid sending large base64 to DB text column if avoidable, or handle standardly

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
          user_id: user.id,
          music_url: newPrefs.musicUrl,
          music_title: newPrefs.musicTitle,
          theme: newPrefs.theme,
          updated_at: new Date().toISOString(),
        };

        if (!hasLargeFile) {
          payload.background_url = newPrefs.backgroundUrl;
          payload.background_type = newPrefs.backgroundType;
        }

        const { error } = await supabase
          .from("user_preferences")
          .upsert(payload, { onConflict: "user_id" });

        if (error) console.error("Failed to sync prefs to DB", error);
      }
    },
    [user, preferences],
  );

  const setMusicUrl = useCallback(
    (url: string, title?: string) => {
      return updatePreferences({ musicUrl: url, musicTitle: title || "" });
    },
    [updatePreferences],
  );

  const setBackgroundUrl = useCallback(
    (url: string, type: "image" | "video" | "none") => {
      return updatePreferences({ backgroundUrl: url, backgroundType: type });
    },
    [updatePreferences],
  );

  const setTheme = useCallback(
    (theme: "dark" | "light" | "book") => {
      const p = updatePreferences({ theme });
      document.documentElement.classList.remove("dark", "light", "book");
      document.documentElement.classList.add(theme);
      return p;
    },
    [updatePreferences],
  );

  return {
    preferences,
    isLoading,
    updatePreferences,
    setMusicUrl,
    setBackgroundUrl,
    setTheme,
  };
};
