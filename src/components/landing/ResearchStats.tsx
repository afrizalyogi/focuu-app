import { Clock, Brain, Battery, TrendingUp } from "lucide-react";

const ResearchStats = () => {
  return (
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
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 animate-fade-up backdrop-blur-sm">
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
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 animate-fade-up backdrop-blur-sm" style={{ animationDelay: "100ms" }}>
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
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 animate-fade-up backdrop-blur-sm" style={{ animationDelay: "200ms" }}>
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
      </div>
    </section>
  );
};

export const ExponentialGrowthSection = () => {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12 animate-fade-up">
          <p className="text-xs text-primary uppercase tracking-wider mb-4 font-medium">
            The compound effect
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Small focus, exponential results
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Just 1 hour of deep work daily compounds to 365 hours of pure productivity per year
          </p>
        </div>

        {/* Exponential Chart */}
        <div className="relative p-8 rounded-3xl bg-card/30 backdrop-blur-xl border border-border/30 animate-fade-up">
          <div className="flex items-end justify-between gap-4 h-64 px-4">
            {/* Chart bars with exponential growth */}
            {[
              { month: "M1", height: 8, value: "30h" },
              { month: "M2", height: 15, value: "60h" },
              { month: "M3", height: 25, value: "90h" },
              { month: "M6", height: 45, value: "180h" },
              { month: "Y1", height: 75, value: "365h" },
              { month: "Y2", height: 100, value: "730h" },
            ].map((bar, index) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-primary font-medium">{bar.value}</span>
                <div 
                  className="w-full rounded-t-lg transition-all duration-700 relative group"
                  style={{ 
                    height: `${bar.height}%`,
                    background: `linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.5) 100%)`,
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: "0 0 30px hsl(var(--primary) / 0.5), inset 0 0 20px hsl(var(--primary) / 0.2)",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{bar.month}</span>
              </div>
            ))}
          </div>

          {/* Trend line indicator */}
          <div className="absolute top-6 right-6 flex items-center gap-2 text-primary">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Exponential growth</span>
          </div>

          {/* Comparison text */}
          <div className="mt-8 pt-6 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-3xl font-bold text-red-400 mb-1">~50h</p>
              <p className="text-sm text-muted-foreground">Average person's yearly deep work</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-3xl font-bold text-green-400 mb-1">730h+</p>
              <p className="text-sm text-muted-foreground">With focuu in 2 years</p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground/60 mt-6">
          Based on 2 hours of focused work per day with focuu
        </p>
      </div>
    </section>
  );
};

export default ResearchStats;
