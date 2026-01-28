import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal Navigation */}
      <header className="flex items-center justify-end p-4 md:p-6">
        <button
          onClick={() => navigate("/pricing")}
          className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-calm"
        >
          Pricing
        </button>
      </header>

      {/* SECTION 1: HERO */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-6 pb-10 min-h-[70vh]">
          <div className="flex flex-col items-center text-center max-w-lg animate-fade-up">
            {/* Brand */}
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-8">
              focuu
            </h1>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl font-medium text-foreground mb-6">
              Work, quietly.
            </p>

            {/* Subtext */}
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
              A calm workspace that helps you stay present,
              <br />
              without pressure or distraction.
            </p>

            {/* Primary CTA */}
            <Button
              onClick={() => navigate("/work")}
              size="lg"
              className="px-10 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
            >
              Enter work mode
            </Button>

            {/* Subtext below CTA */}
            <p className="mt-4 text-sm text-muted-foreground/60">
              No sign up. No noise.
            </p>
          </div>
        </section>

        {/* SECTION 2: WHAT FOCUU IS / IS NOT */}
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            {/* What focuu is */}
            <div className="animate-fade-up">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-4">
                What focuu is
              </p>
              <ul className="space-y-3 text-foreground">
                <li>A place to work</li>
                <li>A gentle structure</li>
                <li>A quiet presence</li>
              </ul>
            </div>

            {/* What focuu is not */}
            <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-4">
                What focuu is not
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li>A productivity tracker</li>
                <li>A task overload</li>
                <li>A social platform</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT FEELS */}
        <section className="py-16 px-6 border-t border-border/30">
          <div className="max-w-md mx-auto text-center animate-fade-up">
            <ul className="space-y-4 text-foreground">
              <li>You focus on one thing at a time</li>
              <li>You work with the energy you have</li>
              <li>You stop without guilt</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: TRANSITION COPY + FINAL CTA */}
        <section className="py-20 px-6 border-t border-border/30">
          <div className="max-w-md mx-auto text-center animate-fade-up">
            {/* Psychological bridge */}
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              You don't need to feel ready.
              <br />
              Just enter work mode.
            </p>

            {/* Final CTA */}
            <Button
              onClick={() => navigate("/work")}
              size="lg"
              className="px-12 py-6 text-base font-medium transition-calm hover:scale-[1.02]"
            >
              Enter work mode
            </Button>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="flex items-center justify-center gap-6 py-8 text-xs text-muted-foreground/40">
        <span>focuu ©</span>
        <button
          onClick={() => navigate("/privacy")}
          className="hover:text-muted-foreground/60 transition-calm"
        >
          Privacy
        </button>
        <button
          onClick={() => navigate("/terms")}
          className="hover:text-muted-foreground/60 transition-calm"
        >
          Terms
        </button>
      </footer>
    </div>
  );
};

export default Landing;
