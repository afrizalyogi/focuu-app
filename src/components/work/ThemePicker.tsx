import { useState } from "react";
import { Moon, Sun, BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light" | "book";

interface ThemePickerProps {
  value: Theme;
  onChange: (theme: Theme) => void;
  showPreview?: boolean;
}

const themes: { value: Theme; label: string; icon: typeof Moon; description: string }[] = [
  { 
    value: "dark", 
    label: "Dark", 
    icon: Moon,
    description: "Easy on the eyes" 
  },
  { 
    value: "light", 
    label: "Light", 
    icon: Sun,
    description: "Clean and bright" 
  },
  { 
    value: "book", 
    label: "Book", 
    icon: BookOpen,
    description: "Warm and focused" 
  },
];

const ThemePicker = ({ value, onChange, showPreview = true }: ThemePickerProps) => {
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);
  const displayTheme = hoveredTheme || value;

  return (
    <div className="space-y-4">
      {/* Theme buttons */}
      <div className="flex gap-2">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = value === theme.value;
          
          return (
            <button
              key={theme.value}
              onClick={() => onChange(theme.value)}
              onMouseEnter={() => setHoveredTheme(theme.value)}
              onMouseLeave={() => setHoveredTheme(null)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                "border",
                isSelected 
                  ? "bg-primary/10 border-primary/50" 
                  : "bg-card/30 border-border/30 hover:bg-card/50 hover:border-primary/30"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isSelected ? "bg-primary/20" : "bg-secondary/50"
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {theme.label}
              </span>
              {isSelected && (
                <Check className="w-3 h-3 text-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="relative">
          <p className="text-xs text-muted-foreground/60 mb-2">Preview</p>
          <ThemePreview theme={displayTheme} />
        </div>
      )}
    </div>
  );
};

// Mini preview of the work page in each theme
const ThemePreview = ({ theme }: { theme: Theme }) => {
  const themeStyles = {
    dark: {
      bg: "bg-[#0a0a0a]",
      card: "bg-[#1a1a1a]",
      text: "text-white",
      muted: "text-gray-500",
      border: "border-white/10",
      primary: "bg-blue-500",
    },
    light: {
      bg: "bg-white",
      card: "bg-gray-50",
      text: "text-black",
      muted: "text-gray-400",
      border: "border-black/10",
      primary: "bg-blue-500",
    },
    book: {
      bg: "bg-[#f5f0e6]",
      card: "bg-[#ebe4d6]",
      text: "text-[#2c2417]",
      muted: "text-[#8b7355]",
      border: "border-[#d4c8b0]",
      primary: "bg-[#8b5e3c]",
    },
  };

  const styles = themeStyles[theme];

  return (
    <div className={cn(
      "rounded-xl overflow-hidden border",
      styles.bg,
      styles.border
    )}>
      {/* Mini work page preview */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={cn("w-8 h-1 rounded-full", styles.muted, "opacity-30")} />
          <div className="flex gap-1">
            <div className={cn("w-2 h-2 rounded-full", styles.muted, "opacity-30")} />
            <div className={cn("w-2 h-2 rounded-full", styles.muted, "opacity-30")} />
          </div>
        </div>
        
        {/* Timer */}
        <div className="text-center py-4">
          <div className={cn("text-2xl font-light", styles.text)}>25:00</div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center gap-2">
          <div className={cn("w-8 h-8 rounded-full", styles.card, styles.border, "border")} />
          <div className={cn("w-8 h-8 rounded-full", styles.primary)} />
          <div className={cn("w-8 h-8 rounded-full", styles.card, styles.border, "border")} />
        </div>
        
        {/* Presence */}
        <div className="flex justify-center gap-1 pt-2">
          <div className={cn("w-4 h-4 rounded-full", styles.primary, "opacity-30")} />
          <div className={cn("text-xs", styles.muted)}>12 working</div>
        </div>
      </div>
    </div>
  );
};

export default ThemePicker;
