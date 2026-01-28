import { useState } from "react";
import { Clock, Brain, Battery, TrendingUp } from "lucide-react";

const ResearchStats = () => {
  return (
    <section className="py-20 border-t border-border/20">
      <div className="w-full max-w-6xl mx-auto px-6">
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
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Points for the exponential curve (x, y coordinates)
  const dataPoints = [
    { x: 50, y: 265, label: "Week 1", value: "7h", fullLabel: "Week 1" },
    { x: 130, y: 255, label: "M1", value: "30h", fullLabel: "Month 1" },
    { x: 210, y: 230, label: "M3", value: "90h", fullLabel: "Month 3" },
    { x: 300, y: 180, label: "M6", value: "180h", fullLabel: "Month 6" },
    { x: 390, y: 100, label: "Y1", value: "365h", fullLabel: "Year 1" },
    { x: 480, y: 25, label: "Y2", value: "730h", fullLabel: "Year 2" },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      
      <div className="w-full max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-12 animate-fade-up">
          <p className="text-xs text-primary uppercase tracking-wider mb-4 font-medium">
            The compound effect
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Small focus, exponential results
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Just 1 hour of deep work daily compounds to 365 hours of pure work per year
          </p>
        </div>

        {/* Interactive Exponential Chart */}
        <div 
          className="relative p-8 rounded-3xl bg-card/30 backdrop-blur-xl border border-border/30 animate-fade-up"
          onMouseEnter={() => setIsAnimated(true)}
        >
          {/* Trend line indicator */}
          <div className="absolute top-6 right-6 flex items-center gap-2 text-primary z-10">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Exponential growth</span>
          </div>

          <div className="relative h-80 mt-4">
            <svg 
              viewBox="0 0 530 300" 
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Gradient for the curve */}
                <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="hsl(280, 100%, 70%)" stopOpacity="1" />
                </linearGradient>
                
                {/* Gradient for area fill */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>

                {/* Glow filter */}
                <filter id="curveGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Y-axis labels */}
              <text x="25" y="30" className="fill-muted-foreground text-[10px]" textAnchor="middle">730h</text>
              <text x="25" y="90" className="fill-muted-foreground text-[10px]" textAnchor="middle">500h</text>
              <text x="25" y="150" className="fill-muted-foreground text-[10px]" textAnchor="middle">250h</text>
              <text x="25" y="210" className="fill-muted-foreground text-[10px]" textAnchor="middle">100h</text>
              <text x="25" y="265" className="fill-muted-foreground text-[10px]" textAnchor="middle">0h</text>

              {/* Subtle horizontal grid lines */}
              {[60, 120, 180, 240].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  strokeDasharray="4,8"
                  opacity="0.3"
                />
              ))}

              {/* Area under curve - smooth exponential fill */}
              <path
                d="M 50 270 
                   Q 90 268, 130 260
                   Q 180 250, 210 235
                   Q 260 210, 300 180
                   Q 350 140, 390 95
                   Q 440 45, 480 20
                   L 480 270 Z"
                fill="url(#areaGradient)"
                className={isAnimated ? "animate-fade-in" : "opacity-0"}
                style={{ animationDuration: "1s" }}
              />

              {/* Main exponential curve - smooth upward arc */}
              <path
                d="M 50 268 
                   Q 90 265, 130 258
                   Q 180 248, 210 232
                   Q 260 205, 300 175
                   Q 350 135, 390 90
                   Q 440 40, 480 18"
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#curveGlow)"
                className={isAnimated ? "animate-fade-in" : "opacity-0"}
                style={{ 
                  animationDuration: "0.8s",
                  strokeDasharray: isAnimated ? "none" : "1000",
                  strokeDashoffset: isAnimated ? "0" : "1000",
                  transition: "stroke-dashoffset 1.5s ease-out"
                }}
              />

              {/* Interactive Data points on the curve */}
              {dataPoints.map((point, index) => (
                <g 
                  key={index}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                  style={{ 
                    opacity: isAnimated ? 1 : 0,
                    transition: `opacity 0.3s ease-out ${index * 0.1}s`
                  }}
                >
                  {/* Hit area for better interaction */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="20"
                    fill="transparent"
                  />
                  
                  {/* Outer glow circle - larger when hovered */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint === index ? 16 : 10}
                    fill="hsl(var(--primary))"
                    opacity={hoveredPoint === index ? 0.4 : 0.2}
                    className="transition-all duration-300"
                  />
                  
                  {/* Main circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint === index ? 8 : 6}
                    fill="hsl(var(--primary))"
                    className="transition-all duration-300"
                  />
                  
                  {/* Inner dot */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="2.5"
                    fill="hsl(var(--background))"
                  />
                  
                  {/* Value label - show on hover or always for key points */}
                  <g 
                    className={`transition-all duration-300 ${
                      hoveredPoint === index ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {/* Background pill for better readability when hovered */}
                    {hoveredPoint === index && (
                      <rect
                        x={point.x - 35}
                        y={point.y - 50}
                        width="70"
                        height="32"
                        rx="6"
                        fill="hsl(var(--card))"
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                    )}
                    
                    <text
                      x={point.x}
                      y={hoveredPoint === index ? point.y - 38 : point.y - 18}
                      textAnchor="middle"
                      className={`fill-primary font-semibold transition-all duration-300 ${
                        hoveredPoint === index ? "text-[13px]" : "text-[11px]"
                      }`}
                    >
                      {point.value}
                    </text>
                    
                    {hoveredPoint === index && (
                      <text
                        x={point.x}
                        y={point.y - 24}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px]"
                      >
                        {point.fullLabel}
                      </text>
                    )}
                  </g>
                  
                  {/* Month label below - always visible */}
                  <text
                    x={point.x}
                    y={285}
                    textAnchor="middle"
                    className={`fill-muted-foreground transition-all duration-300 ${
                      hoveredPoint === index ? "text-[11px] fill-foreground" : "text-[10px]"
                    }`}
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
                stroke="hsl(var(--border))"
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