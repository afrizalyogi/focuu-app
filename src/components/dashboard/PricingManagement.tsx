import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CreditCard,
  DollarSign,
  Calendar,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  interval: "monthly" | "yearly" | "lifetime";
  features: string[];
  is_active: boolean;
  payment_link?: string;
};

const PricingManagement = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState<Partial<PricingPlan>>({
    name: "",
    description: "",
    price_cents: 0,
    interval: "monthly",
    features: [],
    is_active: true,
    payment_link: "",
  });

  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pricing_plans")
      .select("*")
      .order("price_cents", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive",
      });
    } else {
      setPlans((data as PricingPlan[]) || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price_cents) {
      toast({
        title: "Validation Error",
        description: "Name and Price are required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price_cents: Number(formData.price_cents),
      interval: formData.interval,
      features: formData.features, // JSONB handles array directly
      is_active: formData.is_active,
      payment_link: formData.payment_link,
    };

    let error;
    if (editingPlan) {
      const { error: updateError } = await supabase
        .from("pricing_plans")
        .update(payload)
        .eq("id", editingPlan.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("pricing_plans")
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: editingPlan ? "Plan updated" : "Plan created",
      });
      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("pricing_plans")
      .delete()
      .eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Plan deleted",
      });
      fetchPlans();
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      price_cents: 0,
      interval: "monthly",
      features: [],
      is_active: true,
      payment_link: "",
    });
    setFeatureInput("");
  };

  const openEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setIsDialogOpen(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 text-center md:text-left items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Pricing Plans</h2>
          <p className="text-sm text-muted-foreground">
            Manage subscription packages and pricing
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Plan" : "Create New Plan"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plan Name</label>
                  <Input
                    placeholder="e.g. Pro Monthly"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (Cents)</label>
                  <Input
                    type="number"
                    placeholder="900 = $9.00"
                    value={formData.price_cents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_cents: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Billing Interval
                  </label>
                  <Select
                    value={formData.interval}
                    onValueChange={(val: PricingPlan["interval"]) =>
                      setFormData({ ...formData, interval: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      type="button"
                      variant={formData.is_active ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, is_active: true })
                      }
                    >
                      Active
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.is_active ? "destructive" : "outline"}
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, is_active: false })
                      }
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Payment Link (Optional)
                </label>
                <Input
                  placeholder="https://..."
                  value={formData.payment_link || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_link: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  External payment link override
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Features</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {formData.features?.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm bg-muted p-2 rounded-md"
                    >
                      <span>{feat}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFeature(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading plans...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-card/50 border-border/30 relative ${
                !plan.is_active ? "opacity-60 grayscale" : ""
              }`}
            >
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(plan)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start pr-8">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatCurrency(plan.price_cents)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{plan.interval}
                  </span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.features?.map((feat, i) => (
                    <div key={i} className="flex items-center text-sm gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{feat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                {!plan.is_active && (
                  <Badge
                    variant="destructive"
                    className="w-full justify-center"
                  >
                    Inactive
                  </Badge>
                )}
                {plan.is_active && (
                  <Badge
                    variant="outline"
                    className="w-full justify-center text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
                  >
                    Active Plan
                  </Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingManagement;
