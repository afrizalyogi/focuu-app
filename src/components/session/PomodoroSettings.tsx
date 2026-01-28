import { cn } from "@/lib/utils";
import { EnergyMode, ENERGY_CONFIGS } from "@/hooks/useSessionTimer";
import { Input } from "@/components/ui/input";

interface PomodoroSettingsProps {
  energyMode: EnergyMode;
  onEnergyModeChange: (mode: EnergyMode) => void;
  customWorkMinutes: number;
  onCustomWorkMinutesChange: (minutes: number) => void;
  customBreakMinutes: number;
  onCustomBreakMinutesChange: (minutes: number) => void;
  disabled?: boolean;
}

const presets: { value: Exclude<EnergyMode, "custom">; label: string; work: number; break: number }[] = [
  { value: "low", label: "Light", work: 15, break: 5 },
  { value: "normal", label: "Standard", work: 25, break: 5 },
  { value: "focused", label: "Deep", work: 45, break: 10 },
];

const PomodoroSettings = ({
  energyMode,
  onEnergyModeChange,
  customWorkMinutes,
  onCustomWorkMinutesChange,
  customBreakMinutes,
  onCustomBreakMinutesChange,
  disabled,
}: PomodoroSettingsProps) => {
  const isCustomSelected = energyMode === "custom";

  const handleWorkMinutesChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 5 && num <= 120) {
      onCustomWorkMinutesChange(num);
    }
  };

  const handleBreakMinutesChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 30) {
      onCustomBreakMinutesChange(num);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">Choose your rhythm</p>
      
      {/* Preset options */}
      <div className="flex gap-2 flex-wrap justify-center">
        {presets.map((preset) => {
          const isSelected = energyMode === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => onEnergyModeChange(preset.value)}
              disabled={disabled}
              className={cn(
                "px-4 py-3 rounded-lg text-sm font-medium transition-calm min-w-[90px]",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="block">{preset.label}</span>
              <span className="block text-xs opacity-60 mt-1">
                {preset.work}m / {preset.break}m
              </span>
            </button>
          );
        })}

        {/* Custom option */}
        <button
          onClick={() => onEnergyModeChange("custom")}
          disabled={disabled}
          className={cn(
            "px-4 py-3 rounded-lg text-sm font-medium transition-calm min-w-[90px]",
            isCustomSelected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="block">Custom</span>
          <span className="block text-xs opacity-60 mt-1">
            {isCustomSelected ? `${customWorkMinutes}m / ${customBreakMinutes}m` : "? / ?"}
          </span>
        </button>
      </div>

      {/* Custom inputs */}
      {isCustomSelected && (
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Work</span>
            <Input
              type="number"
              min={5}
              max={120}
              value={customWorkMinutes}
              onChange={(e) => handleWorkMinutesChange(e.target.value)}
              className="w-16 text-center bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Break</span>
            <Input
              type="number"
              min={1}
              max={30}
              value={customBreakMinutes}
              onChange={(e) => handleBreakMinutesChange(e.target.value)}
              className="w-16 text-center bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroSettings;