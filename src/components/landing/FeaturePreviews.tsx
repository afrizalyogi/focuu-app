import { useState, useEffect } from "react";
import { Timer, Users, BarChart3, MessageCircle, ListChecks, Moon } from "lucide-react";

const FeaturePreviews = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      id: "timer",
      icon: Timer,
      title: "Flexible Focus Timer",
      description: "Stopwatch or Pomodoro. Work your way.",
      preview: <TimerPreview />,
    },
    {
      id: "presence",
      icon: Users,
      title: "Work Together, Quietly",
      description: "See others working. Not alone anymore.",
      preview: <PresencePreview />,
    },
    {
      id: "tasks",
      icon: ListChecks,
      title: "Simple Task Focus",
      description: "One thing at a time. No overwhelm.",
      preview: <TasksPreview />,
    },
    {
      id: "chat",
      icon: MessageCircle,
      title: "Gentle Encouragement",
      description: "A quiet room of support.",
      preview: <ChatPreview />,
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Work Analytics",
      description: "Track progress, compare weeks, forecast growth.",
      preview: <AnalyticsPreview />,
    },
    {
      id: "themes",
      icon: Moon,
      title: "Multiple Themes",
      description: "Dark, light, or book mode.",
      preview: <ThemesPreview />,
    },
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Everything you need, nothing you don't
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple tools that respect your focus
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Feature selector */}
          <div className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${
                    isActive 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-card/30 border border-border/30 hover:bg-card/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/60">
                      {feature.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview area */}
          <div className="relative h-[400px] rounded-3xl bg-card/40 backdrop-blur-xl border border-border/30 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {features[activeFeature].preview}
            </div>
            
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Preview Components
const TimerPreview = () => {
  const [time, setTime] = useState(1523);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  return (
    <div className="text-center animate-fade-in">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
        Session in progress
      </p>
      <div className="text-6xl md:text-7xl font-light tracking-tight text-foreground mb-6">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-card/50 border border-border/50 flex items-center justify-center">
          <div className="w-3 h-3 border-l-2 border-r-2 border-muted-foreground" />
        </div>
        <div className="w-8 h-8 rounded-full bg-card/30 border border-border/30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-muted-foreground rounded-sm" />
        </div>
      </div>
    </div>
  );
};

const PresencePreview = () => {
  const count = 23;
  
  return (
    <div className="text-center animate-fade-in">
      <div className="flex items-center justify-center gap-1 mb-4">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-xs text-primary"
            style={{ marginLeft: i > 0 ? "-8px" : "0" }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
        <div 
          className="w-8 h-8 rounded-full bg-muted/50 border-2 border-border flex items-center justify-center text-xs text-muted-foreground"
          style={{ marginLeft: "-8px" }}
        >
          +{count - 3}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {count} people working right now
      </p>
      <p className="text-xs text-muted-foreground/50 mt-2">
        You're not alone in this
      </p>
    </div>
  );
};

const TasksPreview = () => {
  const tasks = [
    { text: "Finish project proposal", active: true, done: false },
    { text: "Review meeting notes", active: false, done: true },
    { text: "Send follow-up emails", active: false, done: false },
  ];
  
  return (
    <div className="w-full max-w-xs animate-fade-in">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        Today's focus
      </p>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div 
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              task.active 
                ? "bg-primary/10 border border-primary/30" 
                : "bg-secondary/30 border border-border/30"
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              task.done 
                ? "bg-primary border-primary" 
                : task.active 
                  ? "border-primary" 
                  : "border-muted-foreground/30"
            }`}>
              {task.done && <span className="text-[10px] text-primary-foreground">✓</span>}
            </div>
            <span className={`text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatPreview = () => {
  const messages = [
    { time: "14:32", text: "You got this. Keep going." },
    { time: "14:35", text: "Taking a break, back in 5" },
    { time: "14:38", text: "Almost there. Stay with it." },
  ];
  
  return (
    <div className="w-full max-w-xs animate-fade-in">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        Focus Room
      </p>
      <div className="space-y-2 p-3 rounded-xl bg-secondary/30 border border-border/30">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <span className="text-muted-foreground/40 text-xs mr-2">{msg.time}</span>
            <span className="text-foreground/80">{msg.text}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/50 mt-3 text-center">
        Encourage, don't distract
      </p>
    </div>
  );
};

const AnalyticsPreview = () => {
  return (
    <div className="w-full max-w-xs animate-fade-in">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 text-center">
        Weekly Comparison
      </p>
      
      {/* Mini chart */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border/30 mb-3">
        <div className="flex items-end justify-between gap-1 h-20">
          {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-primary/60 rounded-t"
                style={{ height: `${height}%` }}
              />
              <span className="text-[9px] text-muted-foreground/60">
                {["M", "T", "W", "T", "F", "S", "S"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-secondary/20 rounded-lg p-2">
          <p className="text-lg font-bold text-primary">↑12%</p>
          <p className="text-[9px] text-muted-foreground">vs last week</p>
        </div>
        <div className="bg-secondary/20 rounded-lg p-2">
          <p className="text-lg font-bold text-foreground">8.5h</p>
          <p className="text-[9px] text-muted-foreground">total focus</p>
        </div>
        <div className="bg-secondary/20 rounded-lg p-2">
          <p className="text-lg font-bold text-green-500">5</p>
          <p className="text-[9px] text-muted-foreground">day streak</p>
        </div>
      </div>
    </div>
  );
};

const ThemesPreview = () => {
  const themes = [
    { name: "Dark", bg: "bg-[#0a0a0a]", text: "text-white", border: "border-white/10" },
    { name: "Light", bg: "bg-white", text: "text-black", border: "border-black/10" },
    { name: "Book", bg: "bg-[#f5f0e6]", text: "text-[#2c2417]", border: "border-[#d4c8b0]" },
  ];
  
  return (
    <div className="animate-fade-in">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 text-center">
        Choose your mood
      </p>
      <div className="flex gap-4 justify-center">
        {themes.map((theme) => (
          <div 
            key={theme.name}
            className={`w-20 h-28 rounded-xl ${theme.bg} ${theme.border} border-2 flex flex-col items-center justify-center gap-2 shadow-lg`}
          >
            <div className={`w-8 h-1 rounded-full ${theme.name === "Light" ? "bg-black/20" : theme.name === "Book" ? "bg-[#2c2417]/20" : "bg-white/20"}`} />
            <div className={`w-6 h-1 rounded-full ${theme.name === "Light" ? "bg-black/20" : theme.name === "Book" ? "bg-[#2c2417]/20" : "bg-white/20"}`} />
            <span className={`text-xs mt-2 ${theme.text}`}>{theme.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturePreviews;
