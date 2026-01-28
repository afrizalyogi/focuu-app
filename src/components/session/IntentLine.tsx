import { useState } from "react";
import { Input } from "@/components/ui/input";

interface IntentLineProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const IntentLine = ({ value, onChange, disabled }: IntentLineProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full max-w-sm">
      <Input
        type="text"
        placeholder="What brings you here today?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          text-center border-0 border-b bg-transparent
          focus-visible:ring-0 focus-visible:ring-offset-0
          placeholder:text-muted-foreground/40
          transition-calm h-12
          ${isFocused ? "border-primary/50" : "border-border/50"}
        `}
        maxLength={100}
      />
      <p className="mt-3 text-xs text-muted-foreground/40 text-center">
        Private. Only you see this.
      </p>
    </div>
  );
};

export default IntentLine;
