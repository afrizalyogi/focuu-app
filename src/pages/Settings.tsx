import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSettings, ThemeMode } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User,
  Clock,
  Shield,
  Palette,
  Bell,
  Volume2,
  Lock,
  CreditCard,
} from "lucide-react";
import { SettingsPageSkeleton } from "@/components/ui/skeleton-loaders";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { settings, isLoading, updateSettings } = useSettings();

  const isPro = profile?.is_pro ?? false;

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      // Optimistic update or reload could be better, but toast is good for now
      // Assuming useAuth might need a refresh logic if it doesn't listen to realtime
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /* Password Management State */
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const isGoogleUser =
    user?.app_metadata?.provider === "google" ||
    user?.identities?.some((i) => i.provider === "google");
  // Simple check: if they have 'email' provider in identities, they likely have a password.
  // However, Supabase treats primary provider as app_metadata.provider.
  // Best bet: If they are strictly Google, they need to "Set Password". If they have email, they might want to change it.
  const hasPassword = user?.identities?.some((i) => i.provider === "email");

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (hasPassword && !oldPassword) {
        toast.error("Please enter your current password.");
        setIsUpdatingPassword(false);
        return;
      }

      // If user has a password, verify it first by trying to sign in
      if (hasPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || "",
          password: oldPassword,
        });

        if (signInError) {
          toast.error("Incorrect current password.");
          throw signInError;
        }
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setOldPassword("");
    } catch (err) {
      console.error("Error updating password:", err);
      if (!hasPassword) {
        toast.error("Failed to set password.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const themeOptions: {
    value: ThemeMode;
    label: string;
    description: string;
  }[] = [
    { value: "dark", label: "Dark", description: "Default dark theme" },
    { value: "light", label: "Light", description: "Bright light theme" },
    { value: "book", label: "Book", description: "Warm sepia tones" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
        <header className="relative z-10 max-w-6xl mx-auto w-full px-4 py-4 md:py-6">
          <BackButton to="/app" />
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

      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 py-4 md:py-6">
        <BackButton to="/app" />
      </header>

      <main className="relative z-10 flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold text-foreground mb-8">
            Settings
          </h1>

          {/* Profile Section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Profile
              </h2>
            </div>
            <div className="space-y-4 p-4 rounded-xl bg-card/50 border border-border/30">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Avatar Image
                </label>

                <div className="flex flex-col md:flex-row items-start gap-4">
                  {/* Persistent Preview */}
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-border bg-secondary/30 shrink-0 mt-1">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 m-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    <Tabs defaultValue="device" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-2 h-8">
                        <TabsTrigger value="device" className="text-xs">
                          Upload Device
                        </TabsTrigger>
                        <TabsTrigger value="url" className="text-xs">
                          Image URL
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="device" className="mt-0">
                        <label className="block w-full">
                          <div className="flex items-center justify-center w-full h-24 px-4 transition-all border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 cursor-pointer group">
                            <div className="flex flex-col items-center space-y-1 text-center">
                              <div className="p-2 rounded-full bg-secondary group-hover:bg-background transition-colors">
                                <span className="text-xs text-muted-foreground group-hover:text-primary">
                                  Click to browse
                                </span>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !user) return;

                                setIsUpdatingProfile(true);
                                try {
                                  const fileExt = file.name.split(".").pop();
                                  const filePath = `${user.id}-${Math.random()}.${fileExt}`;

                                  const { error: uploadError } =
                                    await supabase.storage
                                      .from("avatars")
                                      .upload(filePath, file);

                                  if (uploadError) throw uploadError;

                                  const { data } = supabase.storage
                                    .from("avatars")
                                    .getPublicUrl(filePath);
                                  setAvatarUrl(data.publicUrl);
                                  toast.success("Image uploaded successfully!");
                                } catch (error) {
                                  console.error(
                                    "Error uploading avatar:",
                                    error,
                                  );
                                  toast.error(
                                    "Error uploading avatar. Please try again.",
                                  );
                                } finally {
                                  setIsUpdatingProfile(false);
                                }
                              }}
                            />
                          </div>
                        </label>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                          Supported formats: JPG, PNG, GIF
                        </p>
                      </TabsContent>

                      <TabsContent value="url" className="mt-0 space-y-2">
                        <input
                          type="text"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="https://example.com/image.png"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Paste a direct link to an image on the web.
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </section>

          {/* Security Section (Password) */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Security
              </h2>
            </div>
            <div className="space-y-4 p-4 rounded-xl bg-card/50 border border-border/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {hasPassword ? "Change Password" : "Set Password"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {hasPassword
                      ? "Update your existing password."
                      : "Create a password to login with email instead of Google."}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {hasPassword && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="New password"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Confirm
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Confirm new"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword || !newPassword}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Account section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Account Status
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
                <span className="text-foreground">Email</span>
                <span className="text-muted-foreground text-sm">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
                <span className="text-foreground">Plan</span>
                <span
                  className={`text-sm px-2 py-0.5 rounded-full ${isPro ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                >
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/app/billing")}
                className="w-full transition-calm justify-between group"
              >
                <span>Manage Billing & History</span>
                <CreditCard className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
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
                  <p
                    className={`font-medium ${settings.theme === option.value ? "text-primary" : "text-foreground"}`}
                  >
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
          {/* <section className="mb-8">
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
          </section> */}

          {/* Session preferences */}
          {/* <section className="mb-8">
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
          </section> */}

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
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">
                      Pro
                    </span>
                  )}
                </div>
                {isPro && settings.workHoursEnabled && (
                  <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-border/30">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        Start
                      </label>
                      <input
                        type="time"
                        value={settings.workHoursStart?.slice(0, 5)}
                        onChange={(e) =>
                          updateSettings({ workHoursStart: e.target.value })
                        }
                        className="block mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        End
                      </label>
                      <input
                        type="time"
                        value={settings.workHoursEnd?.slice(0, 5)}
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
