import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const UpgradePrompt = ({ open, onOpenChange, feature }: UpgradePromptProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            More room to work
          </DialogTitle>
          <DialogDescription className="text-sm">
            focuu Pro gives you more room to work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Unlimited tasks — 3 focus highlights</li>
            <li>• Custom backgrounds (image/video)</li>
            <li>• Ambient music player</li>
            <li>• Daily streak tracking</li>
            <li>• Session notes & insights</li>
            <li>• Work analytics dashboard</li>
            <li>• Presence history</li>
          </ul>

          <div className="flex flex-col gap-2">
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to Pro
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full text-muted-foreground"
            >
              Not now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePrompt;
