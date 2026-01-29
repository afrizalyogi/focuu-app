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
import { Check, ArrowLeft, Sparkles, Zap, Crown } from "lucide-react";

type PlanType = "monthly" | "yearly" | "lifetime";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile, upgradeToPro } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");

  const plans = {
    monthly: { price: 4, period: "/month", savings: null, label: "Monthly" },
    yearly: { price: 36, period: "/year", savings: "Save 25%", label: "Yearly" },
    lifetime: { price: 79, period: "once", savings: "Best value", label: "Lifetime" },
  };

  const handleUpgrade = (plan: PlanType) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedPlan(plan);
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
    "Unlimited tasks — with 3 focus highlights",
    "Custom backgrounds — image or video",
    "Ambient music player — YouTube, Spotify",
    "Daily streak tracking — stay consistent",
    "Session notes — capture insights",
    "Work analytics — track your progress",
    "Custom themes — personalize your space",
    "Time boundaries — permission to stop",
    "Presence history — proof you were here",
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
        <div className="max-w-4xl w-full animate-fade-up">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Pro</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Remove small frictions
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              focuu Pro gives you more room to work — without the noise.
            </p>
          </div>

          {/* Plan selector */}
          {!isPro && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {(["monthly", "yearly", "lifetime"] as PlanType[]).map((plan) => {
                const planData = plans[plan];
                const isPopular = plan === "yearly";
                const isBest = plan === "lifetime";
                
                return (
                  <button
                    key={plan}
                    onClick={() => handleUpgrade(plan)}
                    className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                      isPopular 
                        ? "border-primary bg-primary/5" 
                        : "border-border/50 bg-card/30 hover:border-border"
                    }`}
                  >
                    {planData.savings && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isBest ? "bg-yellow-500/20 text-yellow-500" : "bg-primary/20 text-primary"
                      }`}>
                        {planData.savings}
                      </span>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {isPopular && <Zap className="w-4 h-4 text-primary" />}
                      {isBest && <Crown className="w-4 h-4 text-yellow-500" />}
                      <span className="font-medium text-foreground">{planData.label}</span>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-4xl font-bold text-foreground">${planData.price}</span>
                      <span className="text-muted-foreground text-sm ml-1">{planData.period}</span>
                    </div>
                    
                    {plan === "yearly" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        $3/month billed annually
                      </p>
                    )}
                    {plan === "lifetime" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Pay once, own forever
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Pro features */}
          <div className="mb-10 max-w-md mx-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 text-center">
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

          {/* CTA for Pro users */}
          {isPro && (
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
          )}

          {/* No pressure note */}
          <p className="text-xs text-muted-foreground/50 text-center mt-8">
            focuu will still be here if you stay free.
          </p>
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              {selectedPlan === "monthly" && "$4/month — cancel anytime"}
              {selectedPlan === "yearly" && "$36/year — save 25%"}
              {selectedPlan === "lifetime" && "$79 once — yours forever"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <p className="text-sm font-medium">What you'll get:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited tasks with focus highlights</li>
                <li>• Custom backgrounds & music</li>
                <li>• Daily streak tracking</li>
                <li>• Work analytics & insights</li>
                <li>• Session notes</li>
                <li>• Time boundaries</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Demo checkout</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>focuu Pro ({plans[selectedPlan].label})</span>
                  <span>${plans[selectedPlan].price}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span>
                    ${plans[selectedPlan].price}
                    {selectedPlan !== "lifetime" && plans[selectedPlan].period}
                  </span>
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
