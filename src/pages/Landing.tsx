import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePresenceCount } from "@/hooks/usePresenceCount";
import { ArrowRight, Sparkles, Clock, Brain, Battery, TrendingDown } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const presenceCount = usePresenceCount();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Floating orbs for depth */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-breathe pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-breathe pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <div className="text-lg font-semibold text-foreground/80">focuu</div>
        <div className="flex items-center gap-6">
          {presenceCount > 0 && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{presenceCount} working now</span>
            </div>
          )}
          <button
            onClick={() => navigate("/pricing")}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="text-sm text-muted-foreground hover:text-foreground transition-calm"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-6 pb-10 min-h-[70vh]">
          <div className="flex flex-col items-center text-center max-w-2xl">
            {/* Badge */}
            <div className="animate-fade-up mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Your calm workspace awaits</span>
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
              <div className="animate-fade-up mt-12 flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50" style={{ animationDelay: "400ms" }}>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(presenceCount, 3))].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-background flex items-center justify-center text-xs text-primary"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {presenceCount} {presenceCount === 1 ? "person" : "people"} working right now
                </span>
              </div>
            )}
          </div>
        </section>

        {/* RESEARCH STATS SECTION */}
        <section className="py-20 px-6 border-t border-border/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 animate-fade-up">
              <p className="text-xs text-primary uppercase tracking-wider mb-4 font-medium">
                The science is clear
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Why focus matters
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Research shows that constant context-switching destroys deep work
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* Stat 1 - Gloria Mark Research */}
              <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 animate-fade-up">
                <div className="absolute top-4 right-4">
                  <Clock className="w-5 h-5 text-red-400/50" />
                </div>
                <p className="text-5xl md:text-6xl font-bold text-red-400 mb-2">23</p>
                <p className="text-lg font-medium text-foreground mb-2">minutes</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Time to refocus after a single interruption
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4">
                  — Gloria Mark, UC Irvine
                </p>
              </div>

              {/* Stat 2 - Context Switching */}
              <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 animate-fade-up" style={{ animationDelay: "100ms" }}>
                <div className="absolute top-4 right-4">
                  <Brain className="w-5 h-5 text-yellow-400/50" />
                </div>
                <p className="text-5xl md:text-6xl font-bold text-yellow-400 mb-2">40%</p>
                <p className="text-lg font-medium text-foreground mb-2">productivity loss</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From multitasking and context switching
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4">
                  — American Psychological Association
                </p>
              </div>

              {/* Stat 3 - Deep Work */}
              <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="absolute top-4 right-4">
                  <Battery className="w-5 h-5 text-green-400/50" />
                </div>
                <p className="text-5xl md:text-6xl font-bold text-green-400 mb-2">4h</p>
                <p className="text-lg font-medium text-foreground mb-2">max deep work</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Daily limit for focused cognitive work
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4">
                  — Cal Newport, Deep Work
                </p>
              </div>
            </div>

            {/* Visual comparison */}
            <div className="max-w-2xl mx-auto animate-fade-up">
              <div className="relative p-6 rounded-2xl bg-secondary/30 border border-border/30">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-medium text-foreground">Daily focus capacity</p>
                  <TrendingDown className="w-4 h-4 text-red-400" />
                </div>
                
                {/* Bar comparison */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">With constant interruptions</span>
                      <span className="text-red-400 font-medium">~1.1h</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[14%] bg-gradient-to-r from-red-500 to-red-400 rounded-full" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">With focuu</span>
                      <span className="text-green-400 font-medium">~3.5h</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[87%] bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground/60 text-center mt-6">
                  Based on reducing context switches from 100+/day to focused blocks
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 px-6 bg-secondary/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Built for how you actually work
              </h2>
              <p className="text-muted-foreground text-lg">
                Not another productivity trap
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group p-6 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 animate-fade-up">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-medium mb-2">One thing at a time</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Focus on what matters. Let everything else fade away.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 animate-fade-up" style={{ animationDelay: "100ms" }}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Work with your energy</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Low, normal, or deep. Choose what fits your day.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 animate-fade-up" style={{ animationDelay: "200ms" }}>
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
        <section className="py-24 px-6">
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
