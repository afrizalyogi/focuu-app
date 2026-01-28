import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile, upgradeToPro } = useAuth();

  const handleUpgrade = () => {
    // In real implementation, this would redirect to Stripe
    // For now, simulate instant upgrade
    upgradeToPro();
    navigate("/app");
  };

  const isPro = profile?.is_pro ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 md:p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-md text-center animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-4">
            focuu Pro
          </h1>
          <p className="text-muted-foreground mb-10">
            Remove small frictions that add up over time.
          </p>

          {/* What it's not */}
          <div className="text-left mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              What focuu is not
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· A productivity tracker</li>
              <li>· A social platform</li>
              <li>· A gamified challenge</li>
            </ul>
          </div>

          {/* What Pro unlocks */}
          <div className="text-left mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              What Pro quietly unlocks
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li>✓ Saved work modes — your rhythm, remembered</li>
              <li>✓ Auto-start — open focuu, session begins</li>
              <li>✓ Presence history — proof you were here</li>
              <li>✓ Time boundaries — permission to stop</li>
            </ul>
          </div>

          {/* Price */}
          <div className="mb-8">
            <p className="text-4xl font-semibold text-foreground">
              $4
              <span className="text-lg text-muted-foreground font-normal">
                /month
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cancel anytime
            </p>
          </div>

          {/* CTA */}
          {isPro ? (
            <div className="text-center">
              <p className="text-foreground mb-4">You're on Pro.</p>
              <Button
                variant="outline"
                onClick={() => navigate("/app")}
                className="transition-calm"
              >
                Go to dashboard
              </Button>
            </div>
          ) : user ? (
            <Button
              onClick={handleUpgrade}
              size="lg"
              className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
            >
              Upgrade to Pro
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
            >
              Sign up for Pro
            </Button>
          )}

          {/* No pressure note */}
          <p className="text-xs text-muted-foreground mt-6">
            focuu will still be here if you stay free.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
