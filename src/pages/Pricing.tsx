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
import { Check, ArrowLeft, Sparkles } from "lucide-react";

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
    await new Promise(resolve => setTimeout(resolve, 1500));
    await upgradeToPro();
    setIsProcessing(false);
    setShowCheckout(false);
    navigate("/app");
  };

  const isPro = profile?.is_pro ?? false;

  const proFeatures = [
    "Saved work modes — your rhythm, remembered",
    "Auto-start — open focuu, session begins",
    "Presence history — proof you were here",
    "Time boundaries — permission to stop",
    "3 active tasks — focused daily planning",
    "Session notes — capture without leaving",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      <header className="relative z-10 p-4 md:p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-md w-full animate-fade-up">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Pro</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-3">
              focuu Pro
            </h1>
            <p className="text-muted-foreground">
              Remove small frictions that add up over time.
            </p>
          </div>

          {/* Pro features */}
          <div className="mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
              What Pro quietly unlocks
            </p>
            <ul className="space-y-3">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="text-center mb-10 p-6 rounded-xl bg-card/50 border border-border/30">
            <p className="text-5xl font-bold text-foreground">
              $4
              <span className="text-lg text-muted-foreground font-normal">
                /month
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
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
              className="w-full py-6 text-base font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
            >
              {user ? "Upgrade to Pro" : "Sign up for Pro"}
            </Button>
          )}

          {/* No pressure note */}
          <p className="text-xs text-muted-foreground/50 text-center mt-6">
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
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <p className="text-sm font-medium">What you'll get:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Saved work modes</li>
                <li>• Auto-start sessions</li>
                <li>• Presence history</li>
                <li>• Time boundaries</li>
                <li>• 3 active tasks</li>
                <li>• Session notes</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
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
