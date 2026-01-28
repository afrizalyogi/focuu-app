import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePresenceCount } from "@/hooks/usePresenceCount";

const Landing = () => {
  const navigate = useNavigate();
  const presenceCount = usePresenceCount();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with presence */}
      <header className="flex items-center justify-end p-4 md:p-6">
        {presenceCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-focuu-presence animate-pulse-soft" />
            <span>{presenceCount} working now</span>
          </div>
        )}
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center text-center max-w-lg animate-fade-up">
          {/* Logo */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-6">
            focuu
          </h1>

          {/* Tagline - per PRD */}
          <p className="text-xl md:text-2xl font-medium text-foreground mb-2">
            Work, quietly.
          </p>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground mb-8">
            Consistently.
          </p>

          {/* Subtext - calm, observational */}
          <p className="text-base text-muted-foreground mb-12 max-w-sm leading-relaxed">
            A calm space to stay present without pressure, distraction, or performance anxiety.
          </p>

          {/* CTA */}
          <Button
            onClick={() => navigate("/work")}
            size="lg"
            className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
          >
            Start working
          </Button>

          {/* No signup text */}
          <p className="mt-6 text-sm text-muted-foreground">
            No account needed
          </p>
        </div>
      </main>

      {/* Footer links */}
      <footer className="flex items-center justify-center gap-6 p-6 text-sm text-muted-foreground/60">
        <button
          onClick={() => navigate("/auth")}
          className="hover:text-muted-foreground transition-calm"
        >
          Sign in
        </button>
        <button
          onClick={() => navigate("/pricing")}
          className="hover:text-muted-foreground transition-calm"
        >
          Pro
        </button>
      </footer>
    </div>
  );
};

export default Landing;
