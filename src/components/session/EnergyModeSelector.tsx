import { useState } from "react";
import { EnergyMode } from "@/hooks/useSessionTimer";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EnergyModeSelectorProps {
  selected: EnergyMode;
  onSelect: (mode: EnergyMode) => void;
  customMinutes: number;
  onCustomMinutesChange: (minutes: number) => void;
  disabled?: boolean;
}

const modes: { value: Exclude<EnergyMode, "custom">; label: string; duration: string }[] = [
  { value: "low", label: "Low", duration: "15 min" },
  { value: "normal", label: "Normal", duration: "30 min" },
  { value: "focused", label: "Deep", duration: "45 min" },
];

const EnergyModeSelector = ({ 
  selected, 
  onSelect, 
  customMinutes,
  onCustomMinutesChange,
  disabled 
}: EnergyModeSelectorProps) => {
  const isCustomSelected = selected === "custom";

  const handleCustomClick = () => {
    onSelect("custom");
  };

  const handleCustomMinutesChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 5 && num <= 120) {
      onCustomMinutesChange(num);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">How much energy today?</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {modes.map((mode) => {
          const isSelected = selected === mode.value;
          return (
            <button
              key={mode.value}
              onClick={() => onSelect(mode.value)}
              disabled={disabled}
              className={cn(
                "px-5 py-3 rounded-lg text-sm font-medium transition-calm",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="block">{mode.label}</span>
              <span className="block text-xs opacity-60 mt-0.5">{mode.duration}</span>
            </button>
          );
        })}

        {/* Custom time option */}
        <button
          onClick={handleCustomClick}
          disabled={disabled}
          className={cn(
            "px-5 py-3 rounded-lg text-sm font-medium transition-calm",
            isCustomSelected 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="block">Custom</span>
          <span className="block text-xs opacity-60 mt-0.5">
            {isCustomSelected ? `${customMinutes} min` : "? min"}
          </span>
        </button>
      </div>

      {/* Custom time input - only show when custom is selected */}
      {isCustomSelected && (
        <div className="flex items-center gap-2 animate-fade-in">
          <Input
            type="number"
            min={5}
            max={120}
            value={customMinutes}
            onChange={(e) => handleCustomMinutesChange(e.target.value)}
            className="w-20 text-center bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
            disabled={disabled}
          />
          <span className="text-sm text-muted-foreground">minutes</span>
        </div>
      )}
    </div>
  );
};

export default EnergyModeSelector;
