import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings, ThemeMode } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Clock, Shield, Palette, Bell, Volume2 } from "lucide-react";
import { SettingsPageSkeleton } from "@/components/ui/skeleton-loaders";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { settings, isLoading, updateSettings } = useSettings();

  const isPro = profile?.is_pro ?? false;

  const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
    { value: "dark", label: "Dark", description: "Default dark theme" },
    { value: "light", label: "Light", description: "Bright light theme" },
    { value: "book", label: "Book", description: "Warm sepia tones" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
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
          <SettingsPageSkeleton />
        </main>
      </div>
    );
  }

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

          {/* Theme section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Theme
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ theme: option.value })}
                  className={`p-4 rounded-xl border transition-calm text-left ${
                    settings.theme === option.value
                      ? "bg-primary/10 border-primary/50"
                      : "bg-card/50 border-border/30 hover:border-border/50"
                  }`}
                >
                  <p className={`font-medium ${settings.theme === option.value ? "text-primary" : "text-foreground"}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Notifications section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Notifications
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
                <div>
                  <p className="text-foreground font-medium">Push notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get notified when breaks end
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ notificationsEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">Sound</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Play sounds for timer events
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ soundEnabled: checked })
                  }
                />
              </div>
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
