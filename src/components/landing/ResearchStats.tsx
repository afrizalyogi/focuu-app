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
  const chartData = [
    { month: "M1", height: 20, value: "30h", y: 200 },
    { month: "M2", height: 35, value: "60h", y: 165 },
    { month: "M3", height: 50, value: "90h", y: 130 },
    { month: "M6", height: 75, value: "180h", y: 80 },
    { month: "Y1", height: 120, value: "365h", y: 40 },
    { month: "Y2", height: 180, value: "730h", y: 10 },
  ];

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

        {/* Exponential Chart - SVG Based */}
        <div className="relative p-8 rounded-3xl bg-card/30 backdrop-blur-xl border border-border/30 animate-fade-up">
          {/* Trend line indicator */}
          <div className="absolute top-6 right-6 flex items-center gap-2 text-primary z-10">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Exponential growth</span>
          </div>

          <div className="relative h-72 mt-4">
            <svg 
              viewBox="0 0 600 220" 
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(231, 94%, 67%)" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(231, 94%, 67%)" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(231, 94%, 67%)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(280, 100%, 70%)" stopOpacity="1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y + 10}
                  x2="570"
                  y2={y + 10}
                  stroke="hsl(220, 13%, 15%)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))}

              {/* Exponential curve */}
              <path
                d="M 70 200 Q 120 190, 160 175 T 250 140 T 340 90 T 430 50 T 530 15"
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
                className="animate-[draw_2s_ease-out_forwards]"
              />

              {/* Area under curve */}
              <path
                d="M 70 200 Q 120 190, 160 175 T 250 140 T 340 90 T 430 50 T 530 15 L 530 210 L 70 210 Z"
                fill="url(#barGradient)"
                opacity="0.15"
              />

              {/* Data points with bars */}
              {chartData.map((point, index) => {
                const x = 70 + index * 92;
                const barHeight = point.height;
                return (
                  <g key={point.month}>
                    {/* Bar */}
                    <rect
                      x={x - 20}
                      y={210 - barHeight}
                      width="40"
                      height={barHeight}
                      fill="url(#barGradient)"
                      rx="4"
                      className="transition-all duration-500 hover:opacity-80"
                      style={{ animationDelay: `${index * 150}ms` }}
                    />
                    
                    {/* Glow circle on curve */}
                    <circle
                      cx={x}
                      cy={point.y + 10}
                      r="6"
                      fill="hsl(231, 94%, 67%)"
                      filter="url(#glow)"
                    />
                    <circle
                      cx={x}
                      cy={point.y + 10}
                      r="3"
                      fill="white"
                    />

                    {/* Value label */}
                    <text
                      x={x}
                      y={210 - barHeight - 8}
                      textAnchor="middle"
                      className="fill-primary text-[11px] font-medium"
                    >
                      {point.value}
                    </text>

                    {/* Month label */}
                    <text
                      x={x}
                      y={230}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[11px]"
                    >
                      {point.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Comparison text */}
          <div className="mt-6 pt-6 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-6">
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
