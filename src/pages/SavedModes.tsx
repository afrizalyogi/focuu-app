import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedModes } from "@/hooks/useSavedModes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnergyMode } from "@/hooks/useSessionTimer";
import { ArrowLeft, Plus, Star, Trash2 } from "lucide-react";

const ENERGY_CONFIGS: Record<Exclude<EnergyMode, "custom">, { sessionLength: number; breakLength: number }> = {
  low: { sessionLength: 15, breakLength: 10 },
  normal: { sessionLength: 30, breakLength: 5 },
  focused: { sessionLength: 45, breakLength: 5 },
};

const SavedModes = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { modes, saveMode, setDefaultMode, deleteMode } = useSavedModes();

  const [isCreating, setIsCreating] = useState(false);
  const [newModeName, setNewModeName] = useState("");
  const [selectedEnergy, setSelectedEnergy] = useState<Exclude<EnergyMode, "custom">>("normal");

  const isPro = profile?.is_pro ?? false;

  const handleCreateMode = () => {
    if (!newModeName.trim()) return;
    
    const config = ENERGY_CONFIGS[selectedEnergy];
    saveMode(newModeName.trim(), selectedEnergy, config.sessionLength, config.breakLength);
    setNewModeName("");
    setIsCreating(false);
  };

  if (!isPro) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
        
        <header className="relative z-10 p-4 md:p-6">
          <button
            onClick={() => navigate("/app")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="text-center max-w-sm animate-fade-up">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Saved modes
            </h1>
            <p className="text-muted-foreground mb-8">
              Save your preferred work rhythm so it loads automatically.
            </p>
            <Button
              onClick={() => navigate("/pricing")}
              className="transition-calm"
            >
              Available in Pro
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
      
      <header className="relative z-10 p-4 md:p-6">
        <button
          onClick={() => navigate("/app")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Saved modes
          </h1>
          <p className="text-muted-foreground mb-8">
            Your default loads when you open focuu.
          </p>

          {/* Modes list */}
          <div className="space-y-3 mb-8">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30 hover:border-border/50 transition-calm"
              >
                <div className="flex items-center gap-3">
                  {mode.isDefault && (
                    <Star className="w-4 h-4 text-primary fill-primary" />
                  )}
                  <div>
                    <p className="text-foreground font-medium">
                      {mode.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mode.energyMode} · {mode.sessionLength} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!mode.isDefault && (
                    <button
                      onClick={() => setDefaultMode(mode.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-calm px-2 py-1 rounded-lg hover:bg-secondary"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => deleteMode(mode.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-calm rounded-lg hover:bg-secondary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {modes.length === 0 && !isCreating && (
              <div className="p-8 rounded-xl bg-secondary/30 border border-border/30 text-center">
                <p className="text-muted-foreground">
                  No saved modes yet.
                </p>
              </div>
            )}
          </div>

          {/* Create new mode */}
          {isCreating ? (
            <div className="p-4 rounded-xl bg-card/50 border border-border/30 space-y-4">
              <Input
                placeholder="Mode name"
                value={newModeName}
                onChange={(e) => setNewModeName(e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
              />
              <div className="flex gap-2">
                {(["low", "normal", "focused"] as const).map((energy) => (
                  <button
                    key={energy}
                    onClick={() => setSelectedEnergy(energy)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-calm ${
                      selectedEnergy === energy
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {energy.charAt(0).toUpperCase() + energy.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateMode} className="flex-1">
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setNewModeName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="w-full transition-calm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create new mode
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedModes;
