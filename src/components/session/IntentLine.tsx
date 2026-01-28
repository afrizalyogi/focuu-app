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
        placeholder="What are you working on?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          text-center border-0 border-b bg-transparent
          focus-visible:ring-0 focus-visible:ring-offset-0
          placeholder:text-muted-foreground/50
          transition-calm
          ${isFocused ? "border-primary" : "border-border"}
        `}
        maxLength={100}
      />
      <p className="mt-2 text-xs text-muted-foreground/50 text-center">
        Private. Only you can see this.
      </p>
    </div>
  );
};

export default IntentLine;
