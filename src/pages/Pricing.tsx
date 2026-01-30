import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  ArrowLeft,
  Sparkles,
  Zap,
  Crown,
  Palette,
  BarChart3,
} from "lucide-react";

type PlanType = "monthly" | "yearly" | "lifetime";

type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  interval: PlanType;
  features: string[];
  payment_link?: string;
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile, upgradeToPro } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbPlans, setDbPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pricing_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_cents", { ascending: true });

    if (data) {
      // Correct type casting mapping
      const mappedPlans = data.map((p: any) => ({
        ...p,
        interval: p.interval as PlanType,
      }));
      setDbPlans(mappedPlans);
      // Select 'yearly' by default if exists, else first one
      const yearly = mappedPlans.find((p: any) => p.interval === "yearly");
      if (yearly) setSelectedPlanId(yearly.id);
      else if (mappedPlans.length > 0) setSelectedPlanId(mappedPlans[0].id);
    }
    setLoading(false);
  };

  const getPlanDetails = (plan: PricingPlan) => {
    if (plan.interval === "monthly") return { period: "/month", savings: null };
    if (plan.interval === "yearly")
      return { period: "/year", savings: "Best Value" };
    return { period: "once", savings: "Lifetime Access" };
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const selected = dbPlans.find((p) => p.id === selectedPlanId);
    if (selected?.payment_link) {
      window.open(selected.payment_link, "_blank");
      return;
    }
    setShowCheckout(true);
  };

  const handleDummyCheckout = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await upgradeToPro();
    setIsProcessing(false);
    setShowCheckout(false);
    navigate("/app");
  };

  const isPro = profile?.is_pro ?? false;
  const selectedPlan = dbPlans.find((p) => p.id === selectedPlanId);

  // Highlighted features - personalization & analytics first
  const highlightedFeatures = [
    {
      icon: Palette,
      title: "Personalization",
      items: [
        "Custom backgrounds — image or video",
        "Custom themes — personalize your space",
        "Ambient music player — YouTube, Spotify",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      items: [
        "Work analytics — track your progress",
        "Daily streak tracking — stay consistent",
        "Presence history — proof you were here",
      ],
    },
  ];

  const otherFeatures = [
    "Unlimited tasks — with 3 focus highlights",
    "Session notes — capture insights",
    "Time boundaries — permission to stop",
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Pro</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Make it truly yours
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Personalize your workspace and track your focus journey with Pro.
            </p>
          </div>

          {!isPro && (
            <>
              {/* Highlighted features - Personalization & Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {highlightedFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {feature.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Other features */}
              <div className="mb-10 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                  Plus everything else
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {otherFeatures.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-sm text-muted-foreground"
                    >
                      <Check className="w-3 h-3 text-primary" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Plan selector */}
              {loading ? (
                <div className="text-center py-10 text-muted-foreground">
                  Loading plans...
                </div>
              ) : (
                <div className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 text-center">
                    Choose your plan
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    {dbPlans.map((plan) => {
                      const { period, savings } = getPlanDetails(plan);
                      const isSelected = selectedPlanId === plan.id;
                      const isPopular = plan.interval === "yearly";
                      const isBest = plan.interval === "lifetime";

                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? plan.interval === "lifetime"
                                ? "border-yellow-400 bg-primary/5 scale-[1.02] z-10 shadow-lg shadow-yellow-400/10"
                                : "border-primary bg-primary/5 scale-[1.02] z-10"
                              : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                          }`}
                        >
                          {savings && (
                            <span
                              className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap shadow-sm ${
                                isBest
                                  ? "bg-yellow-500 text-yellow-950"
                                  : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {savings}
                            </span>
                          )}

                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            {isPopular && (
                              <Zap className="w-3.5 h-3.5 text-primary" />
                            )}
                            {isBest && (
                              <Crown className="w-3.5 h-3.5 text-yellow-500" />
                            )}
                            <span className="font-medium text-foreground text-sm uppercase">
                              {plan.name}
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-2xl font-bold text-foreground">
                              ${plan.price_cents / 100}
                            </span>
                            <span className="text-muted-foreground text-xs ml-0.5">
                              {period}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected plan details */}
                  {selectedPlan && (
                    <div className="text-center border-t border-border/50 pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedPlan.description}
                      </p>
                      <Button
                        onClick={handleCheckout}
                        size="lg"
                        className="px-8"
                        disabled={showCheckout}
                      >
                        Continue with {selectedPlan.name}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* No pressure note */}
              <p className="text-xs text-muted-foreground/50 text-center">
                focuu will still be here if you stay free.
              </p>
            </>
          )}

          {/* CTA for Pro users */}
          {isPro && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground text-lg mb-2">You're on Pro.</p>
              <p className="text-muted-foreground text-sm mb-6">
                Thank you for supporting focuu.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/app")}
                className="transition-calm"
              >
                Go to dashboard
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <>
                  {selectedPlan.name} — ${selectedPlan.price_cents / 100}{" "}
                  {getPlanDetails(selectedPlan).period}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <p className="text-sm font-medium">What you'll get:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedPlan?.features &&
                typeof selectedPlan.features === "object" ? (
                  // @ts-ignore
                  selectedPlan.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary" />
                      {feat}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-primary" />
                      Custom backgrounds, themes & music
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-primary" />
                      Analytics, streaks & presence history
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Order summary
              </p>
              {selectedPlan && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>focuu Pro ({selectedPlan.name})</span>
                    <span>${selectedPlan.price_cents / 100}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>
                      ${selectedPlan.price_cents / 100}
                      {getPlanDetails(selectedPlan).period}
                    </span>
                  </div>
                </div>
              )}
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
