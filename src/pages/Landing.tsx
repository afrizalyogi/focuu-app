import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePresenceCount } from "@/hooks/usePresenceCount";
import { ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import GlassOrbs from "@/components/landing/GlassOrbs";
import ResearchStats, { ExponentialGrowthSection } from "@/components/landing/ResearchStats";
import PresenceDisplay, { NavbarPresence } from "@/components/landing/PresenceDisplay";

const Landing = () => {
  const navigate = useNavigate();
  const presenceCount = usePresenceCount();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Glass orbs background */}
      <GlassOrbs />

      {/* Navigation with CTA */}
      <Navbar showPresence={<NavbarPresence count={presenceCount} />} />

      {/* HERO SECTION */}
      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center pb-10 min-h-[70vh]">
          <div className="w-full max-w-6xl mx-auto px-6">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              {/* Badge */}
              <div className="animate-fade-up mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>For people who actually want to work</span>
                </div>
              </div>

              {/* Main headline */}
              <h1 className="animate-fade-up text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground" style={{ animationDelay: "100ms" }}>
                Work, quietly.
              </h1>

              {/* Subheadline */}
              <p className="animate-fade-up text-xl md:text-2xl text-muted-foreground mb-4 max-w-lg leading-relaxed" style={{ animationDelay: "200ms" }}>
                A calm workspace that helps you stay present
              </p>
              
              <p className="animate-fade-up text-lg text-muted-foreground/60 mb-10" style={{ animationDelay: "250ms" }}>
                No pressure. No distraction. Just you and your work.
              </p>

              {/* CTA Group */}
              <div className="animate-fade-up flex flex-col sm:flex-row items-center gap-4" style={{ animationDelay: "300ms" }}>
                <Button
                  onClick={() => navigate("/work")}
                  size="lg"
                  className="group px-8 py-6 text-base font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
                >
                  Enter work mode
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-sm text-muted-foreground/50">
                  No sign up required
                </p>
              </div>

              {/* Live presence indicator */}
              {presenceCount > 0 && (
                <div className="mt-12">
                  <PresenceDisplay count={presenceCount} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RESEARCH STATS SECTION */}
        <ResearchStats />

        {/* EXPONENTIAL GROWTH SECTION */}
        <ExponentialGrowthSection />

        {/* FEATURES SECTION */}
        <section className="py-20 bg-secondary/10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
          <div className="w-full max-w-6xl mx-auto px-6 relative">
            <div className="text-center mb-16 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Built for how you actually work
              </h2>
              <p className="text-muted-foreground text-lg">
                Not another trap
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 animate-fade-up">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-medium mb-2">One thing at a time</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Focus on what matters. Let everything else fade away.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 animate-fade-up" style={{ animationDelay: "100ms" }}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Work with your energy</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Low, normal, or deep. Choose what fits your day.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌙</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Stop without guilt</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You showed up. That's enough. Permission to rest.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 relative">
          <div className="w-full max-w-6xl mx-auto px-6">
            <div className="max-w-xl mx-auto text-center animate-fade-up">
              {/* Motivational copy */}
              <p className="text-2xl md:text-3xl font-medium text-foreground mb-4">
                You don't need to feel ready.
              </p>
              <p className="text-xl text-muted-foreground mb-10">
                Just enter work mode.
              </p>

              {/* Final CTA */}
              <Button
                onClick={() => navigate("/work")}
                size="lg"
                className="group px-12 py-7 text-lg font-medium transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20"
              >
                Start working now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="mt-6 text-sm text-muted-foreground/50">
                Free forever. Pro when you're ready.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center gap-8 py-8 border-t border-border/20 text-xs text-muted-foreground/40">
        <span>© focuu</span>
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
