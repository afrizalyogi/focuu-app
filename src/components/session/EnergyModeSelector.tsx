import { EnergyMode } from "@/hooks/useSessionTimer";

interface EnergyModeSelectorProps {
  selected: EnergyMode;
  onSelect: (mode: EnergyMode) => void;
  disabled?: boolean;
}

const modes: { value: EnergyMode; label: string; duration: string }[] = [
  { value: "low", label: "Low", duration: "15 min" },
  { value: "normal", label: "Normal", duration: "30 min" },
  { value: "focused", label: "Focused", duration: "45 min" },
];

const EnergyModeSelector = ({ selected, onSelect, disabled }: EnergyModeSelectorProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">Energy</p>
      <div className="flex gap-2">
        {modes.map((mode) => {
          const isSelected = selected === mode.value;
          return (
            <button
              key={mode.value}
              onClick={() => onSelect(mode.value)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-calm
                ${isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <span className="block">{mode.label}</span>
              <span className="block text-xs opacity-70">{mode.duration}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EnergyModeSelector;
