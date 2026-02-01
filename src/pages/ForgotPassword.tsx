import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import BackButton from "@/components/common/BackButton";

const emailSchema = z.string().email("Please enter a valid email");

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a password reset link");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between px-4 py-4 md:py-6">
        <BackButton to="/auth" label="Back to sign in" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-fade-up">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">
              Reset password
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your email to receive a reset link
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
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
