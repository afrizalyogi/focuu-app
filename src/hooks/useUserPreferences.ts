import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";

interface UserPreferences {
  musicUrl: string;
  musicTitle: string;
  backgroundUrl: string;
  backgroundType: "image" | "video" | "none";
  theme: "dark" | "light" | "book";
}

const LOCAL_PREFS_KEY = "focuu_user_prefs";

const defaultPrefs: UserPreferences = {
  musicUrl: "",
  musicTitle: "",
  backgroundUrl: "",
  backgroundType: "none",
  theme: "dark",
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPrefs);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);

      if (user) {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        // Sync local preferences if they exist and DB is empty (or just merge?)
        // Strategy: If local exists, overwrite DB (newest wins? or user intent was local work)
        // Usually, if logging in, we prefer DB data unless DB is empty.
        // Let's adopt strategy: If DB result is empty OR we have local changes pending, upsert local.
        // But simpler: just check if local exists, if so upsert to DB, then clear local.
        const localPrefs = localStorage.getItem(LOCAL_PREFS_KEY);
        if (localPrefs) {
          try {
            // We only sync if we have local prefs. Ops! DB might have data too.
            // If we force push local, we might overwrite previous session work from another device.
            // But valid use case is: User customized as guest, then logged in. We should keep their guest customizations.
            // So: Upsert local to DB.
            const parsed = JSON.parse(localPrefs);
            await supabase.from("user_preferences").upsert(
              {
                user_id: user.id,
                music_url: parsed.musicUrl,
                music_title: parsed.musicTitle,
                background_url: parsed.backgroundUrl,
                background_type: parsed.backgroundType,
                theme: parsed.theme,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" },
            );

            localStorage.removeItem(LOCAL_PREFS_KEY);
            console.log("Synced local preferences to database");

            // Re-fetch (or just use parsed as current to avoid delay)
            // Let's fall through to re-fetch/use data from DB logic below (or we need to reload data variable)
            const { data: refreshedData } = await supabase
              .from("user_preferences")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();
            if (refreshedData) {
              setPreferences({
                musicUrl: refreshedData.music_url || "",
                musicTitle: refreshedData.music_title || "",
                backgroundUrl: refreshedData.background_url || "",
                backgroundType:
                  (refreshedData.background_type as any) || "none",
                theme: (refreshedData.theme as any) || "dark",
              });
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error("Sync prefs error", e);
          }
        }

        if (!error && data) {
          setPreferences({
            musicUrl: data.music_url || "",
            musicTitle: data.music_title || "",
            backgroundUrl: data.background_url || "",
            backgroundType: (data.background_type as any) || "none",
            theme: (data.theme as any) || "dark",
          });
        }
      } else {
        const stored = localStorage.getItem(LOCAL_PREFS_KEY);
        if (stored) {
          try {
            setPreferences({ ...defaultPrefs, ...JSON.parse(stored) });
          } catch {
            localStorage.removeItem(LOCAL_PREFS_KEY);
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

      if (user) {
        await supabase.from("user_preferences").upsert(
          {
            user_id: user.id,
            music_url: newPrefs.musicUrl,
            music_title: newPrefs.musicTitle,
            background_url: newPrefs.backgroundUrl,
            background_type: newPrefs.backgroundType,
            theme: newPrefs.theme,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      } else {
        localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(newPrefs));
      }
    },
    [user, preferences],
  );

  // Shorthand setters
  const setMusicUrl = useCallback(
    (url: string, title?: string) => {
      updatePreferences({ musicUrl: url, musicTitle: title || "" });
    },
    [updatePreferences],
  );

  const setBackgroundUrl = useCallback(
    (url: string, type: "image" | "video" | "none") => {
      updatePreferences({ backgroundUrl: url, backgroundType: type });
    },
    [updatePreferences],
  );

  const setTheme = useCallback(
    (theme: "dark" | "light" | "book") => {
      updatePreferences({ theme });
      // Also apply to document
      document.documentElement.classList.remove("dark", "light", "book");
      document.documentElement.classList.add(theme);
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
