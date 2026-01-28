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
  // True exponential data: starts slow, accelerates rapidly
  const chartData = [
    { month: "Week 1", hours: 7, percentage: 3 },
    { month: "Month 1", hours: 30, percentage: 8 },
    { month: "Month 3", hours: 90, percentage: 18 },
    { month: "Month 6", hours: 180, percentage: 35 },
    { month: "Year 1", hours: 365, percentage: 60 },
    { month: "Year 2", hours: 730, percentage: 100 },
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

        {/* Exponential Chart - Clean SVG Curve */}
        <div className="relative p-8 rounded-3xl bg-card/30 backdrop-blur-xl border border-border/30 animate-fade-up">
          {/* Trend line indicator */}
          <div className="absolute top-6 right-6 flex items-center gap-2 text-primary z-10">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Exponential growth</span>
          </div>

          <div className="relative h-80 mt-4">
            <svg 
              viewBox="0 0 500 300" 
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Gradient for the curve */}
                <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(231, 94%, 67%)" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="hsl(231, 94%, 67%)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="hsl(280, 100%, 70%)" stopOpacity="1" />
                </linearGradient>
                
                {/* Gradient for area fill */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(231, 94%, 67%)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(231, 94%, 67%)" stopOpacity="0" />
                </linearGradient>

                {/* Glow filter */}
                <filter id="curveGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Y-axis labels */}
              <text x="25" y="35" className="fill-muted-foreground text-[10px]" textAnchor="middle">730h</text>
              <text x="25" y="95" className="fill-muted-foreground text-[10px]" textAnchor="middle">500h</text>
              <text x="25" y="155" className="fill-muted-foreground text-[10px]" textAnchor="middle">250h</text>
              <text x="25" y="215" className="fill-muted-foreground text-[10px]" textAnchor="middle">100h</text>
              <text x="25" y="265" className="fill-muted-foreground text-[10px]" textAnchor="middle">0h</text>

              {/* Subtle horizontal grid lines */}
              {[60, 120, 180, 240].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="hsl(220, 13%, 18%)"
                  strokeWidth="1"
                  strokeDasharray="4,8"
                />
              ))}

              {/* Area under curve - smooth exponential shape */}
              <path
                d="M 50 270 
                   C 80 268, 100 265, 130 260
                   C 170 252, 200 240, 240 220
                   C 280 195, 320 160, 360 120
                   C 400 75, 440 45, 480 30
                   L 480 270 Z"
                fill="url(#areaGradient)"
              />

              {/* Main exponential curve - smooth upward arc */}
              <path
                d="M 50 270 
                   C 80 268, 100 265, 130 260
                   C 170 252, 200 240, 240 220
                   C 280 195, 320 160, 360 120
                   C 400 75, 440 45, 480 30"
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#curveGlow)"
              />

              {/* Data points on the curve */}
              {[
                { x: 50, y: 270, label: "Week 1", value: "7h" },
                { x: 130, y: 258, label: "M1", value: "30h" },
                { x: 210, y: 235, label: "M3", value: "90h" },
                { x: 300, y: 190, label: "M6", value: "180h" },
                { x: 390, y: 110, label: "Y1", value: "365h" },
                { x: 480, y: 30, label: "Y2", value: "730h" },
              ].map((point, index) => (
                <g key={index}>
                  {/* Outer glow circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="hsl(231, 94%, 67%)"
                    opacity="0.3"
                    className="animate-pulse-soft"
                  />
                  {/* Main circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="hsl(231, 94%, 67%)"
                  />
                  {/* Inner dot */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill="white"
                  />
                  {/* Value label above point */}
                  <text
                    x={point.x}
                    y={point.y - 15}
                    textAnchor="middle"
                    className="fill-primary text-[11px] font-semibold"
                  >
                    {point.value}
                  </text>
                  {/* Month label below */}
                  <text
                    x={point.x}
                    y={285}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {point.label}
                  </text>
                </g>
              ))}

              {/* Baseline */}
              <line
                x1="50"
                y1="270"
                x2="480"
                y2="270"
                stroke="hsl(220, 13%, 20%)"
                strokeWidth="1"
              />
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
