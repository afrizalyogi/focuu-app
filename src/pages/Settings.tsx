import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface UserSettings {
  autoStart: boolean;
  workHoursEnabled: boolean;
  workHoursStart: string;
  workHoursEnd: string;
}

const SETTINGS_KEY = "focuu_settings";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [settings, setSettings] = useState<UserSettings>({
    autoStart: false,
    workHoursEnabled: false,
    workHoursStart: "09:00",
    workHoursEnd: "18:00",
  });

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SETTINGS_KEY);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const isPro = user?.isPro;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 md:p-6">
        <button
          onClick={() => navigate("/app")}
          className="text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold text-foreground mb-8">
            Settings
          </h1>

          {/* Account section */}
          <section className="mb-10">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Account
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-foreground">Email</span>
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-foreground">Plan</span>
                <span className="text-muted-foreground">
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>
              {!isPro && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/pricing")}
                  className="w-full transition-calm"
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </section>

          {/* Session preferences */}
          <section className="mb-10">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Session
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-foreground">Auto-start</p>
                  <p className="text-xs text-muted-foreground">
                    Session begins when you open focuu
                  </p>
                </div>
                {isPro ? (
                  <Switch
                    checked={settings.autoStart}
                    onCheckedChange={(checked) =>
                      updateSettings({ autoStart: checked })
                    }
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Pro</span>
                )}
              </div>
            </div>
          </section>

          {/* Time boundaries */}
          <section className="mb-10">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Boundaries
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-foreground">Work hours</p>
                  <p className="text-xs text-muted-foreground">
                    Remind you to rest outside these hours
                  </p>
                </div>
                {isPro ? (
                  <Switch
                    checked={settings.workHoursEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings({ workHoursEnabled: checked })
                    }
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Pro</span>
                )}
              </div>
              {isPro && settings.workHoursEnabled && (
                <div className="flex gap-4 py-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Start</label>
                    <input
                      type="time"
                      value={settings.workHoursStart}
                      onChange={(e) =>
                        updateSettings({ workHoursStart: e.target.value })
                      }
                      className="block mt-1 bg-card border border-border rounded px-2 py-1 text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">End</label>
                    <input
                      type="time"
                      value={settings.workHoursEnd}
                      onChange={(e) =>
                        updateSettings({ workHoursEnd: e.target.value })
                      }
                      className="block mt-1 bg-card border border-border rounded px-2 py-1 text-foreground text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sign out */}
          <Button
            variant="ghost"
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="w-full text-muted-foreground hover:text-foreground transition-calm"
          >
            Sign out
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
