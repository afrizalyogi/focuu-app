import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      {/* Main content - centered */}
      <div className="flex flex-col items-center text-center max-w-lg animate-fade-up">
        {/* Logo */}
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-4">
          focuu
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl font-medium text-foreground mb-3">
          Work, quietly.
        </p>

        {/* Subtext */}
        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
          A calm space to help you stay present without pressure or distraction.
        </p>

        {/* CTA */}
        <Button
          onClick={() => navigate("/work")}
          size="lg"
          className="px-8 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
        >
          Start working
        </Button>

        {/* No signup text */}
        <p className="mt-4 text-sm text-muted-foreground">
          No sign up required
        </p>
      </div>

      {/* Subtle footer */}
      <div className="absolute bottom-8 text-xs text-muted-foreground/50">
        A quiet place to work
      </div>
    </div>
  );
};

export default Landing;
