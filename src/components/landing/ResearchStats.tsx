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

  // TradingView-style data points
  const dataPoints = [
    { x: 60, y: 255, label: "W1", value: "7h", fullLabel: "Week 1", change: "+7h" },
    { x: 140, y: 240, label: "M1", value: "30h", fullLabel: "Month 1", change: "+23h" },
    { x: 220, y: 210, label: "M3", value: "90h", fullLabel: "Month 3", change: "+60h" },
    { x: 300, y: 165, label: "M6", value: "180h", fullLabel: "Month 6", change: "+90h" },
    { x: 380, y: 95, label: "Y1", value: "365h", fullLabel: "Year 1", change: "+185h" },
    { x: 460, y: 35, label: "Y2", value: "730h", fullLabel: "Year 2", change: "+365h" },
  ];

  // Candlestick-like bars for visual interest
  const candleData = [
    { x: 80, open: 265, close: 258, high: 255, low: 268 },
    { x: 120, open: 255, close: 245, high: 242, low: 258 },
    { x: 160, open: 240, close: 225, high: 220, low: 245 },
    { x: 200, open: 220, close: 200, high: 195, low: 225 },
    { x: 240, open: 195, close: 175, high: 170, low: 200 },
    { x: 280, open: 170, close: 150, high: 145, low: 175 },
    { x: 320, open: 145, close: 120, high: 115, low: 150 },
    { x: 360, open: 115, close: 85, high: 80, low: 120 },
    { x: 400, open: 80, close: 55, high: 50, low: 85 },
    { x: 440, open: 50, close: 35, high: 30, low: 55 },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
      
      <div className="w-full max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-10 animate-fade-up">
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

        {/* TradingView-style Chart Container */}
        <div 
          className="relative rounded-2xl bg-[#131722] border border-[#2a2e39] animate-fade-up overflow-hidden"
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

          {/* Chart Area */}
          <div className="relative h-72 px-2">
            <svg 
              viewBox="0 0 500 280" 
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Green gradient for bullish area */}
                <linearGradient id="tvGreenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#26a69a" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#26a69a" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#26a69a" stopOpacity="0" />
                </linearGradient>
                
                {/* Glow effect */}
                <filter id="tvGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines - TradingView style */}
              {[70, 120, 170, 220].map((y) => (
                <line
                  key={y}
                  x1="40"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="#2a2e39"
                  strokeWidth="1"
                />
              ))}
              
              {/* Vertical grid lines */}
              {[100, 180, 260, 340, 420].map((x) => (
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
              <text x="25" y="45" className="text-[9px]" fill="#787b86">730h</text>
              <text x="25" y="95" className="text-[9px]" fill="#787b86">550h</text>
              <text x="25" y="145" className="text-[9px]" fill="#787b86">365h</text>
              <text x="25" y="195" className="text-[9px]" fill="#787b86">180h</text>
              <text x="25" y="245" className="text-[9px]" fill="#787b86">0h</text>

              {/* Candlestick bars - TradingView style */}
              {candleData.map((candle, i) => {
                const isGreen = candle.close < candle.open;
                const color = "#26a69a";
                const barWidth = 8;
                
                return (
                  <g 
                    key={i}
                    className={isAnimated ? "animate-fade-in" : "opacity-0"}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Wick */}
                    <line
                      x1={candle.x}
                      y1={candle.high}
                      x2={candle.x}
                      y2={candle.low}
                      stroke={color}
                      strokeWidth="1"
                    />
                    {/* Body */}
                    <rect
                      x={candle.x - barWidth / 2}
                      y={Math.min(candle.open, candle.close)}
                      width={barWidth}
                      height={Math.abs(candle.close - candle.open)}
                      fill={color}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* Area fill under curve */}
              <path
                d={`M 60 255 
                    Q 100 250, 140 240
                    Q 180 225, 220 210
                    Q 260 185, 300 165
                    Q 340 130, 380 95
                    Q 420 55, 460 35
                    L 460 260 L 60 260 Z`}
                fill="url(#tvGreenGradient)"
                className={isAnimated ? "animate-fade-in" : "opacity-0"}
                style={{ animationDuration: "1s" }}
              />

              {/* Main trend line */}
              <path
                d={`M 60 255 
                    Q 100 250, 140 240
                    Q 180 225, 220 210
                    Q 260 185, 300 165
                    Q 340 130, 380 95
                    Q 420 55, 460 35`}
                fill="none"
                stroke="#26a69a"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#tvGlow)"
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
                    r={hoveredPoint === index ? 6 : 4}
                    fill="#26a69a"
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
                        x1="40"
                        y1={point.y}
                        x2="480"
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
                        x="5"
                        y={point.y - 8}
                        width="30"
                        height="16"
                        rx="2"
                        fill="#26a69a"
                      />
                      <text
                        x="20"
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
              <line x1="40" y1="250" x2="480" y2="250" stroke="#363a45" strokeWidth="1" />
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-2xl font-bold text-[#26a69a]">730h+</p>
              <p className="text-xs text-[#787b86]">With focuu in 2 years</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchStats;