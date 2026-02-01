import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SessionRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const SessionRatingDialog = ({
  open,
  onOpenChange,
  onComplete,
}: SessionRatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (user && rating > 0) {
      try {
        await supabase.from("user_feedback").insert({
          user_id: user.id,
          rating: rating,
          feedback: "Session Rating",
        });
      } catch (e) {
        console.error("Rating error", e);
      }
    }
    setIsSubmitting(false);
    onOpenChange(false);
    onComplete();
    navigate("/app");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          onComplete();
          // Optionally navigate on dismiss too, but "Done" is explicit intent
        }
        onOpenChange(val);
      }}
    >
      <DialogContent className="w-[90vw] max-w-[350px] rounded-3xl bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-medium">
            Session Complete
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center justify-center gap-6">
          <p className="text-muted-foreground text-center">
            How was your focus?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    rating >= star
                      ? "fill-yellow-400 text-yellow-500"
                      : "text-muted-foreground/20",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full rounded-2xl h-12 text-base font-medium"
          >
            {isSubmitting ? "Saving..." : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionRatingDialog;
