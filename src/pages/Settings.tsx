import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Clock, Shield } from "lucide-react";

interface UserSettings {
  autoStart: boolean;
  workHoursEnabled: boolean;
  workHoursStart: string;
  workHoursEnd: string;
}

const SETTINGS_KEY = "focuu_settings";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

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

  const isPro = profile?.is_pro ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      <header className="relative z-10 p-4 md:p-6">
        <button
          onClick={() => navigate("/app")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold text-foreground mb-8">
            Settings
          </h1>

          {/* Account section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Account
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
                <span className="text-foreground">Email</span>
                <span className="text-muted-foreground text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
                <span className="text-foreground">Plan</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${isPro ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
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
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Session
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
                <div>
                  <p className="text-foreground font-medium">Auto-start</p>
                  <p className="text-xs text-muted-foreground mt-1">
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
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">Pro</span>
                )}
              </div>
            </div>
          </section>

          {/* Time boundaries */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Boundaries
              </h2>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">Work hours</p>
                    <p className="text-xs text-muted-foreground mt-1">
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
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">Pro</span>
                  )}
                </div>
                {isPro && settings.workHoursEnabled && (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-border/30">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Start</label>
                      <input
                        type="time"
                        value={settings.workHoursStart}
                        onChange={(e) =>
                          updateSettings({ workHoursStart: e.target.value })
                        }
                        className="block mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">End</label>
                      <input
                        type="time"
                        value={settings.workHoursEnd}
                        onChange={(e) =>
                          updateSettings({ workHoursEnd: e.target.value })
                        }
                        className="block mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
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
