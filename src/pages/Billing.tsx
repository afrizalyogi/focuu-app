import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  receipt_url?: string; // Metadata often has this
}

interface Subscription {
  plan_type: "monthly" | "yearly" | "lifetime";
  status: "active" | "expired" | "cancelled";
  starts_at: string;
  ends_at: string | null;
  auto_renew: boolean;
}

const Billing = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Fetch active subscription
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!subError && subData) {
        setSubscription(subData);
      }

      // Fetch payment history
      const { data: payData, error: payError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (!payError && payData) {
        setPayments(payData);
      }
    } catch (error) {
      console.error("Error fetching billing:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (type?: string) => {
    switch (type) {
      case "monthly":
        return "Pro Monthly";
      case "yearly":
        return "Pro Yearly";
      case "lifetime":
        return "Pro Lifetime";
      default:
        return "Free Plan";
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="relative z-10 max-w-6xl mx-auto w-full px-4 py-4 md:py-6">
          <BackButton to="/app/settings" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 py-4 md:py-6">
        <BackButton to="/app/settings" label="Settings" />
      </header>

      <main className="relative z-10 flex-1 px-4 md:px-6 pb-20 max-w-4xl mx-auto w-full">
        <div className="animate-fade-up space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">
              Billing & Subscription
            </h1>
            {!profile?.is_pro && (
              <Button onClick={() => navigate("/pricing")} className="gap-2">
                Upgrade to Pro <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Current Plan Card */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${profile?.is_pro ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Current Plan
                    </h2>
                    <p className="text-xl font-semibold text-foreground">
                      {getPlanName(subscription?.plan_type)}
                    </p>
                  </div>
                </div>

                {profile?.is_pro ? (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Active status</span>
                    </div>
                    {subscription?.ends_at ? (
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          Renews on{" "}
                          {format(
                            new Date(subscription.ends_at),
                            "MMM d, yyyy",
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Lifetime access</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      You are currently on the free tier. Upgrade to unlock
                      unlimited sessions, advanced analytics, and more.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method / Usage (Placeholder for now) */}
            <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="p-3 bg-secondary rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Payment Method
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Payments are securely processed via Stripe/LemonSqueezy. Manage
                your payment details on their portal.
              </p>
              {profile?.is_pro && (
                <Button variant="outline" className="mt-4" disabled>
                  Manage Payment Method
                </Button>
              )}
            </div>
          </section>

          {/* Payment History */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">
              Payment History
            </h2>
            <div className="rounded-xl border border-border/40 overflow-hidden bg-card/50">
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground border-b border-border/40">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Amount</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-6 py-4 text-foreground">
                            {format(
                              new Date(payment.created_at),
                              "MMM d, yyyy",
                            )}
                          </td>
                          <td className="px-6 py-4 text-foreground font-medium">
                            {formatCurrency(
                              payment.amount_cents,
                              payment.currency,
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                payment.status === "succeeded"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }`}
                            >
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No payment history found.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Billing;
