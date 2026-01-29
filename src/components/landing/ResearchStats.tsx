import { useState } from "react";
import { Clock, Brain, Battery, TrendingUp, ArrowUpRight } from "lucide-react";

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
            <p className="text-lg font-medium text-foreground mb-2">loss</p>
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

  // Data points for the area chart
  const dataPoints = [
    { x: 40, y: 255, label: "W1", value: "7h", fullLabel: "Week 1", change: "+7h" },
    { x: 120, y: 240, label: "M1", value: "30h", fullLabel: "Month 1", change: "+23h" },
    { x: 200, y: 210, label: "M3", value: "90h", fullLabel: "Month 3", change: "+60h" },
    { x: 280, y: 165, label: "M6", value: "180h", fullLabel: "Month 6", change: "+90h" },
    { x: 360, y: 95, label: "Y1", value: "365h", fullLabel: "Year 1", change: "+185h" },
    { x: 440, y: 35, label: "Y2", value: "730h", fullLabel: "Year 2", change: "+365h" },
  ];

  // Create smooth curve path
  const createAreaPath = () => {
    const points = dataPoints.map(p => `${p.x},${p.y}`);
    return `M ${points[0]} 
            C ${dataPoints[0].x + 30},${dataPoints[0].y} ${dataPoints[1].x - 30},${dataPoints[1].y} ${dataPoints[1].x},${dataPoints[1].y}
            C ${dataPoints[1].x + 30},${dataPoints[1].y - 10} ${dataPoints[2].x - 30},${dataPoints[2].y + 10} ${dataPoints[2].x},${dataPoints[2].y}
            C ${dataPoints[2].x + 30},${dataPoints[2].y - 15} ${dataPoints[3].x - 30},${dataPoints[3].y + 15} ${dataPoints[3].x},${dataPoints[3].y}
            C ${dataPoints[3].x + 30},${dataPoints[3].y - 25} ${dataPoints[4].x - 30},${dataPoints[4].y + 25} ${dataPoints[4].x},${dataPoints[4].y}
            C ${dataPoints[4].x + 30},${dataPoints[4].y - 20} ${dataPoints[5].x - 30},${dataPoints[5].y + 20} ${dataPoints[5].x},${dataPoints[5].y}`;
  };

  const createFilledAreaPath = () => {
    return `${createAreaPath()} L 440,260 L 40,260 Z`;
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
      
      <div className="w-full relative">
        <div className="text-center mb-10 animate-fade-up px-6">
          <p className="text-xs text-primary uppercase tracking-wider mb-4 font-medium">
            The compound effect
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Small focus, exponential results
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Just 1 hour of deep work daily compounds to 365 hours per year
          </p>
        </div>

        {/* Full-width Chart Container - edge to edge */}
        <div 
          className="relative bg-[#131722] border-y border-[#2a2e39] animate-fade-up overflow-hidden"
          onMouseEnter={() => setIsAnimated(true)}
        >
          {/* Chart Header - TradingView style */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">FOCUS/TIME</span>
                <span className="text-xs text-[#787b86]">Deep Work Hours</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-[#26a69a]" />
                <span className="text-sm font-medium text-[#26a69a]">+1360%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#787b86]">
                <span>2Y</span>
              </div>
            </div>
          </div>

          {/* Price/Value Display */}
          <div className="px-4 py-2 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">730</span>
            <span className="text-sm text-[#787b86]">hours</span>
            <span className="text-sm text-[#26a69a]">+680h (1360%)</span>
          </div>

          {/* Chart Area - Full width */}
          <div className="relative h-72 w-full">
            <svg 
              viewBox="0 0 480 280" 
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Green gradient for area fill */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#26a69a" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#26a69a" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#26a69a" stopOpacity="0.02" />
                </linearGradient>
                
                {/* Glow effect for line */}
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines - horizontal */}
              {[70, 120, 170, 220].map((y) => (
                <line
                  key={y}
                  x1="20"
                  y1={y}
                  x2="460"
                  y2={y}
                  stroke="#2a2e39"
                  strokeWidth="1"
                />
              ))}
              
              {/* Vertical grid lines */}
              {[80, 160, 240, 320, 400].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="30"
                  x2={x}
                  y2="250"
                  stroke="#2a2e39"
                  strokeWidth="1"
                />
              ))}

              {/* Y-axis labels */}
              <text x="8" y="45" className="text-[9px]" fill="#787b86">730h</text>
              <text x="8" y="95" className="text-[9px]" fill="#787b86">550h</text>
              <text x="8" y="145" className="text-[9px]" fill="#787b86">365h</text>
              <text x="8" y="195" className="text-[9px]" fill="#787b86">180h</text>
              <text x="8" y="245" className="text-[9px]" fill="#787b86">0h</text>

              {/* Area fill under curve */}
              <path
                d={createFilledAreaPath()}
                fill="url(#areaGradient)"
                className={isAnimated ? "animate-fade-in" : "opacity-0"}
                style={{ animationDuration: "1s" }}
              />

              {/* Main trend line */}
              <path
                d={createAreaPath()}
                fill="none"
                stroke="#26a69a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lineGlow)"
                className={isAnimated ? "animate-fade-in" : "opacity-0"}
              />

              {/* Interactive data points */}
              {dataPoints.map((point, index) => (
                <g 
                  key={index}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-crosshair"
                  style={{ 
                    opacity: isAnimated ? 1 : 0,
                    transition: `opacity 0.3s ease-out ${index * 0.1}s`
                  }}
                >
                  {/* Hit area */}
                  <circle cx={point.x} cy={point.y} r="20" fill="transparent" />
                  
                  {/* Point marker */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint === index ? 7 : 5}
                    fill="#131722"
                    stroke="#26a69a"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  
                  {/* Crosshair on hover */}
                  {hoveredPoint === index && (
                    <>
                      {/* Vertical line */}
                      <line
                        x1={point.x}
                        y1="30"
                        x2={point.x}
                        y2="250"
                        stroke="#363a45"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      {/* Horizontal line */}
                      <line
                        x1="20"
                        y1={point.y}
                        x2="460"
                        y2={point.y}
                        stroke="#363a45"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      
                      {/* Tooltip */}
                      <g>
                        <rect
                          x={point.x - 45}
                          y={point.y - 55}
                          width="90"
                          height="45"
                          rx="4"
                          fill="#1e222d"
                          stroke="#363a45"
                          strokeWidth="1"
                        />
                        <text
                          x={point.x}
                          y={point.y - 38}
                          textAnchor="middle"
                          className="text-[11px] font-medium"
                          fill="#fff"
                        >
                          {point.value}
                        </text>
                        <text
                          x={point.x}
                          y={point.y - 22}
                          textAnchor="middle"
                          className="text-[9px]"
                          fill="#26a69a"
                        >
                          {point.change}
                        </text>
                      </g>
                      
                      {/* Y-axis label */}
                      <rect
                        x="2"
                        y={point.y - 8}
                        width="30"
                        height="16"
                        rx="2"
                        fill="#26a69a"
                      />
                      <text
                        x="17"
                        y={point.y + 3}
                        textAnchor="middle"
                        className="text-[8px] font-medium"
                        fill="#fff"
                      >
                        {point.value}
                      </text>
                    </>
                  )}
                  
                  {/* X-axis label */}
                  <text
                    x={point.x}
                    y={268}
                    textAnchor="middle"
                    className="text-[9px]"
                    fill={hoveredPoint === index ? "#fff" : "#787b86"}
                  >
                    {point.label}
                  </text>
                </g>
              ))}

              {/* Bottom axis line */}
              <line x1="20" y1="250" x2="460" y2="250" stroke="#363a45" strokeWidth="1" />
            </svg>
          </div>

          {/* Chart Footer - Stats bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2e39] text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[#787b86]">Start: </span>
                <span className="text-[#ef5350]">~50h/yr avg</span>
              </div>
              <div>
                <span className="text-[#787b86]">End: </span>
                <span className="text-[#26a69a]">730h/2yr</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#26a69a]" />
              <span className="text-[#787b86]">Based on 2h/day focused work</span>
            </div>
          </div>
        </div>

        {/* Comparison cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto px-6">
          <div className="p-5 rounded-xl bg-[#131722] border border-[#2a2e39] flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#ef5350]/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#ef5350]">↓</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#ef5350]">~50h</p>
              <p className="text-xs text-[#787b86]">Average person's yearly deep work</p>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-[#131722] border border-[#2a2e39] flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#26a69a]/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#26a69a]">↑</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#26a69a]">730h</p>
              <p className="text-xs text-[#787b86]">Your potential in 2 years with focuu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchStats;
