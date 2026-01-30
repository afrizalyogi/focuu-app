import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { create } from "zustand";

interface PermissionStore {
  isOpen: boolean;
  message: string;
  showError: (message?: string) => void;
  closeError: () => void;
}

export const usePermissionError = create<PermissionStore>((set) => ({
  isOpen: false,
  message: "You don't have permission to perform this action.",
  showError: (message) =>
    set({
      isOpen: true,
      message: message || "You don't have permission to perform this action.",
    }),
  closeError: () => set({ isOpen: false }),
}));

export const PermissionErrorModal = () => {
  const { isOpen, message, closeError } = usePermissionError();

  return (
    <AlertDialog open={isOpen} onOpenChange={closeError}>
      <AlertDialogContent className="border-destructive/50 bg-destructive/5">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Permission Error</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-foreground/80">
            {message}
            <br />
            <span className="text-xs text-muted-foreground mt-2 block">
              Please ask an administrator to check your account permissions or
              database policies.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={closeError}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Dismiss
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
