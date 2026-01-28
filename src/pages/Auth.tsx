import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    // Simulate magic link flow
    // In real implementation, this would send an email
    await signIn(email);
    setSent(true);
    
    // Auto-redirect after "magic link" confirmation
    setTimeout(() => {
      navigate("/app");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 md:p-6">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          ← Back
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm animate-fade-up">
          {!sent ? (
            <>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-2">
                Save your rhythm
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                We'll send you a quiet link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
                <Button
                  type="submit"
                  className="w-full h-12 transition-calm"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Continue"}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                No password needed.
              </p>
            </>
          ) : (
            <div className="text-center animate-fade-in">
              <p className="text-xl font-medium text-foreground mb-2">
                You're in.
              </p>
              <p className="text-muted-foreground">
                Taking you to your space...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Auth;
