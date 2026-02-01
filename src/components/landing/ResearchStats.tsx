import { useState } from "react";
import { Clock, Brain, Battery, ArrowUpRight } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ResearchStats = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="w-full max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-xs text-primary uppercase tracking-wider mb-4 font-medium">
            Research backed
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Why focus matters
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            The cost of distraction is higher than you think
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Stat 1 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 animate-fade-up backdrop-blur-sm">
            <div className="absolute top-4 right-4">
              <Clock className="w-5 h-5 text-red-400/50" />
            </div>
            <p className="text-5xl md:text-6xl font-bold text-red-400 mb-2">
              23
            </p>
            <p className="text-lg font-medium text-foreground mb-2">minutes</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Time to refocus after a single interruption
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">
              — Gloria Mark, UC Irvine
            </p>
          </div>

          {/* Stat 2 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 animate-fade-up backdrop-blur-sm">
            <div className="absolute top-4 right-4">
              <Brain className="w-5 h-5 text-yellow-400/50" />
            </div>
            <p className="text-5xl md:text-6xl font-bold text-yellow-400 mb-2">
              40%
            </p>
            <p className="text-lg font-medium text-foreground mb-2">loss</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From multitasking and context switching
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">
              — American Psychological Association
            </p>
          </div>

          {/* Stat 3 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 animate-fade-up backdrop-blur-sm">
            <div className="absolute top-4 right-4">
              <Battery className="w-5 h-5 text-green-400/50" />
            </div>
            <p className="text-5xl md:text-6xl font-bold text-green-400 mb-2">
              4h
            </p>
            <p className="text-lg font-medium text-foreground mb-2">
              max deep work
            </p>
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
  const [, setIsAnimated] = useState(false);

  return (
    <section className="py-20 relative overflow-hidden bg-secondary/5">
      <div className="w-full max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-xs text-primary uppercase tracking-wider mb-4 font-medium">
            The compound effect
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Consistency beats intensity
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Early intensity feels productive, but without consistency, it's a
            trap.
          </p>
        </div>

        {/* Chart Container */}
        <div
          className="relative bg-card border border-border rounded-2xl animate-fade-up overflow-hidden mb-8"
          onMouseEnter={() => setIsAnimated(true)}
        >
          {/* Chart Header */}
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between px-4 py-3 border-b border-border rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  THE TORTOISE VS HARE
                </span>
                <span className="text-xs text-muted-foreground">365 Days</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-muted-foreground">Sporadic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">
                  Consistent
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 flex items-baseline gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase">
                1 Year Output
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-500">
                  730h
                </span>
                <span className="text-sm text-foreground">
                  vs 280h (Sporadic)
                </span>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="relative h-72 w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: "M1", consistent: 60, sporadic: 160 }, // Drastic early lead (Hero Mode)
                  { name: "M2", consistent: 120, sporadic: 250 }, // Peaking fast
                  { name: "M3", consistent: 180, sporadic: 260 }, // The Crash (Burnout)
                  { name: "M4", consistent: 240, sporadic: 260 }, // Stagnation
                  { name: "M5", consistent: 300, sporadic: 260 }, // Consistent Overtakes here
                  { name: "M6", consistent: 360, sporadic: 280 }, // Small effort
                  { name: "M7", consistent: 420, sporadic: 280 }, // Stagnation
                  { name: "M8", consistent: 480, sporadic: 280 }, // Stagnation
                  { name: "M9", consistent: 540, sporadic: 320 }, // Motivation Burst
                  { name: "M10", consistent: 600, sporadic: 330 }, // Quick fade
                  { name: "M11", consistent: 660, sporadic: 330 }, // Stagnation
                  { name: "M12", consistent: 730, sporadic: 350 }, // Massive gap at end
                ]}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorConsistent"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorSporadic"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2e39"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: 500 }}
                  labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} hours`, "Total Output"]}
                />
                <Area
                  type="monotone"
                  dataKey="sporadic"
                  name="Sporadic"
                  stroke="#f87171"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSporadic)"
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#f87171" }}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="consistent"
                  name="Consistent"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorConsistent)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail Card Below Chart */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-400" />
              The Cost of Inconsistency
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Based on the "Tortoise and Hare" principle. The red line starts{" "}
              <b>faster</b> (early motivation), but crashes quickly. Consistency
              wins the marathon.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Compounding Consistency
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Focuu keeps you on the green line. <b>730 hours</b> of deep work
              in a year is achieved simply by showing up for 2 hours every day.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-500">
              <span>Consistency</span>
              <span>&gt;</span>
              <span>Intensity</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchStats;
