import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import BackButton from "@/components/common/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

type AuthMode = "sign-up" | "sign-in" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signInWithPassword, signInWithGoogle, user } = useAuth();

  const initialMode =
    searchParams.get("mode") === "reset" ? "reset" : "sign-up";
  const [mode, setMode] = useState<AuthMode>(initialMode as AuthMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if already logged in (unless in preview mode for heatmap)
  const isPreview = searchParams.get("preview") === "true";

  useEffect(() => {
    if (user && !isPreview) {
      navigate("/app");
    }
  }, [user, navigate, isPreview]);

  if (user) {
    return null;
  }

  const validateEmail = () => {
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateEmail() || !validatePassword()) return;

    if (!agreedToTerms) {
      setError("You must agree to the Privacy Policy and Terms of Service");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    const { error } = await signUp(email.trim(), password, {
      full_name: fullName.trim(),
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("This email is already registered. Try signing in instead.");
      } else {
        setError(error.message);
      }
    } else {
      setMessage("Check your email to confirm your account");
    }

    setIsLoading(false);
  };

  const handleSignIn = async () => {
    if (!validateEmail() || !validatePassword()) return;

    setIsLoading(true);
    setError("");
    setMessage("");

    const { error } = await signInWithPassword(email.trim(), password);

    if (error) {
      if (error.message.includes("Invalid login")) {
        setError("Invalid email or password");
      } else {
        setError(error.message);
      }
    } else {
      navigate("/app");
    }

    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/app"), 2000);
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "sign-up") {
      handleSignUp();
    } else if (mode === "reset") {
      handleResetPassword();
    } else {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between px-4 py-4 md:py-6">
        <BackButton to="/" label="Back" />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-fade-up">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">
              {mode === "sign-up"
                ? "Create account"
                : mode === "reset"
                  ? "Set new password"
                  : "Welcome back"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "sign-up"
                ? "Sign up to save your progress"
                : mode === "reset"
                  ? "Enter your new password"
                  : "Sign in to continue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {mode !== "reset" && (
              <>
                {mode === "sign-up" && (
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    disabled={isLoading}
                  />
                )}
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  disabled={isLoading}
                />
              </>
            )}

            <Input
              type="password"
              placeholder={mode === "reset" ? "New password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
              disabled={isLoading}
            />

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
              />
              <label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-snug cursor-pointer select-none"
              >
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>
              </label>
            </div>

            {mode === "reset" && (
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
                disabled={isLoading}
              />
            )}

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {message && (
              <p className="text-sm text-focuu-presence text-center">
                {message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full transition-calm"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading
                ? "..."
                : mode === "sign-up"
                  ? "Create account"
                  : mode === "reset"
                    ? "Update password"
                    : "Sign in"}
            </Button>

            {mode !== "reset" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full transition-calm"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    "..."
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </>
            )}
          </form>

          {/* Mode switchers */}
          {mode !== "reset" && (
            <div className="flex flex-col gap-2 text-center">
              {mode === "sign-in" && (
                <>
                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                  >
                    Forgot password?
                  </button>
                  <button
                    onClick={() => setMode("sign-up")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                  >
                    Create an account
                  </button>
                </>
              )}
              {mode === "sign-up" && (
                <button
                  onClick={() => setMode("sign-in")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => navigate("/work")}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm mt-4"
          >
            Continue without login
          </button>
        </div>
      </main>
    </div>
  );
};

export default Auth;
