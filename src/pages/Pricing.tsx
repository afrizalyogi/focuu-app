import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile, upgradeToPro } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setShowCheckout(true);
  };

  const handleDummyCheckout = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    await upgradeToPro();
    setIsProcessing(false);
    setShowCheckout(false);
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
          <p className="text-muted-foreground mb-12">
            Remove small frictions that add up over time.
          </p>

          {/* What focuu is not - per PRD explicit exclusions */}
          <div className="text-left mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
              What focuu is not
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· A productivity tracker</li>
              <li>· A social platform</li>
              <li>· A gamified challenge</li>
            </ul>
          </div>

          {/* What Pro unlocks - per PRD features */}
          <div className="text-left mb-12">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
              What Pro quietly unlocks
            </p>
            <ul className="space-y-3 text-sm text-foreground">
              <li>✓ Saved work modes — your rhythm, remembered</li>
              <li>✓ Auto-start — open focuu, session begins</li>
              <li>✓ Presence history — proof you were here</li>
              <li>✓ Time boundaries — permission to stop</li>
            </ul>
          </div>

          {/* Price - per PRD $4/month flat */}
          <div className="mb-10">
            <p className="text-4xl font-semibold text-foreground">
              $4
              <span className="text-lg text-muted-foreground font-normal">
                /month
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
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
          ) : (
            <Button
              onClick={handleUpgrade}
              size="lg"
              className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
            >
              {user ? "Upgrade to Pro" : "Sign up for Pro"}
            </Button>
          )}

          {/* No pressure note */}
          <p className="text-xs text-muted-foreground/60 mt-8">
            focuu will still be here if you stay free.
          </p>
        </div>
      </main>

      {/* Dummy Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              $4/month — cancel anytime
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-secondary p-4 space-y-2">
              <p className="text-sm font-medium">What you'll get:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Saved work modes</li>
                <li>• Live focus chat</li>
                <li>• Guided breathwork</li>
                <li>• Daily planner</li>
                <li>• Presence history</li>
                <li>• Time boundaries</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Demo checkout</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>focuu Pro (monthly)</span>
                  <span>$4.00</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span>$4.00/month</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleDummyCheckout} 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Complete Purchase"}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              This is a demo. No real payment will be processed.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
