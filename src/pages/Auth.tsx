import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "magic-link" | "sign-up" | "sign-in";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithPassword, user } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("magic-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (user) {
    navigate("/app");
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

  const handleMagicLink = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    setError("");
    setMessage("");

    const { error } = await signIn(email.trim());
    
    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a magic link");
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async () => {
    if (!validateEmail() || !validatePassword()) return;

    setIsLoading(true);
    setError("");
    setMessage("");

    const { error } = await signUp(email.trim(), password);
    
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "magic-link") {
      handleMagicLink();
    } else if (mode === "sign-up") {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          ← Back
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-fade-up">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">
              {mode === "sign-up" ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "magic-link" 
                ? "Enter your email for a magic link"
                : mode === "sign-up"
                ? "Sign up to save your progress"
                : "Sign in to continue"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
              disabled={isLoading}
            />

            {(mode === "sign-up" || mode === "sign-in") && (
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
                disabled={isLoading}
              />
            )}

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {message && (
              <p className="text-sm text-focuu-presence text-center">{message}</p>
            )}

            <Button
              type="submit"
              className="w-full transition-calm"
              disabled={isLoading}
            >
              {isLoading 
                ? "..." 
                : mode === "magic-link"
                ? "Send magic link"
                : mode === "sign-up"
                ? "Create account"
                : "Sign in"
              }
            </Button>
          </form>

          {/* Mode switchers */}
          <div className="flex flex-col gap-2 text-center">
            {mode === "magic-link" && (
              <>
                <button
                  onClick={() => setMode("sign-in")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                >
                  Sign in with password
                </button>
                <button
                  onClick={() => setMode("sign-up")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                >
                  Create an account
                </button>
              </>
            )}
            {mode === "sign-in" && (
              <>
                <button
                  onClick={() => setMode("magic-link")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                >
                  Use magic link instead
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
              <>
                <button
                  onClick={() => setMode("sign-in")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                >
                  Already have an account? Sign in
                </button>
                <button
                  onClick={() => setMode("magic-link")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                >
                  Use magic link instead
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
