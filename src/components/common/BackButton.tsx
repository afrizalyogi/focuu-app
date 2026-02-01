import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  to?: string; // If not provided, goes back in history (-1)
  label?: string;
  className?: string;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

const BackButton = ({
  to,
  label = "Back",
  className,
  icon = <ArrowLeft className="w-4 h-4" />,
  onClick,
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }

    if (to) {
      navigate(to);
    } else if (!onClick) {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm group",
        className,
      )}
    >
      <span className="group-hover:-translate-x-0.5 transition-transform duration-300">
        {icon}
      </span>
      {label}
    </button>
  );
};

export default BackButton;
