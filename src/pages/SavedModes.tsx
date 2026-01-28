import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedModes } from "@/hooks/useSavedModes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnergyMode } from "@/hooks/useSessionTimer";

const ENERGY_CONFIGS: Record<EnergyMode, { sessionLength: number; breakLength: number }> = {
  low: { sessionLength: 15, breakLength: 10 },
  normal: { sessionLength: 30, breakLength: 5 },
  focused: { sessionLength: 45, breakLength: 5 },
};

const SavedModes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modes, saveMode, setDefaultMode, deleteMode } = useSavedModes();

  const [isCreating, setIsCreating] = useState(false);
  const [newModeName, setNewModeName] = useState("");
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyMode>("normal");

  const isPro = user?.isPro;

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
        <header className="p-4 md:p-6">
          <button
            onClick={() => navigate("/app")}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            ← Back
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
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
      <header className="p-4 md:p-6">
        <button
          onClick={() => navigate("/app")}
          className="text-sm text-muted-foreground hover:text-foreground transition-calm"
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 px-6 pb-20 max-w-lg mx-auto w-full">
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
                className="flex items-center justify-between p-4 bg-card rounded-lg"
              >
                <div>
                  <p className="text-foreground font-medium">
                    {mode.name}
                    {mode.isDefault && (
                      <span className="text-xs text-accent ml-2">default</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {mode.energyMode} · {mode.sessionLength} min
                  </p>
                </div>
                <div className="flex gap-2">
                  {!mode.isDefault && (
                    <button
                      onClick={() => setDefaultMode(mode.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-calm"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => deleteMode(mode.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-calm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {modes.length === 0 && !isCreating && (
              <p className="text-muted-foreground text-center py-8">
                No saved modes yet.
              </p>
            )}
          </div>

          {/* Create new mode */}
          {isCreating ? (
            <div className="bg-card rounded-lg p-4 space-y-4">
              <Input
                placeholder="Mode name"
                value={newModeName}
                onChange={(e) => setNewModeName(e.target.value)}
                className="bg-background"
              />
              <div className="flex gap-2">
                {(["low", "normal", "focused"] as EnergyMode[]).map((energy) => (
                  <button
                    key={energy}
                    onClick={() => setSelectedEnergy(energy)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-calm ${
                      selectedEnergy === energy
                        ? "bg-accent text-accent-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {energy}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateMode} size="sm">
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
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
              Create new mode
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedModes;
