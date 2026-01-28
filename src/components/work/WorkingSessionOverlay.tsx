import { useState, useEffect } from "react";
import { MessageCircle, Quote, ListTodo, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./TaskPlanner";

// Calm motivational quotes - no hustle culture
const QUOTES = [
  "One moment at a time.",
  "You are here. That is enough.",
  "The work will wait. Your focus won't.",
  "Breathe. Continue.",
  "Small steps, steady progress.",
  "This moment is yours.",
  "Trust the process.",
  "Quiet mind, clear work.",
  "You showed up. That matters.",
  "Just this one thing.",
];

interface ChatNotification {
  id: string;
  text: string;
  timestamp: Date;
}

interface WorkingSessionOverlayProps {
  tasks: Task[];
  notes: string;
  isPro: boolean;
}

const WorkingSessionOverlay = ({ tasks, notes, isPro }: WorkingSessionOverlayProps) => {
  const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
  const [showQuote, setShowQuote] = useState(true);
  const [chatNotification, setChatNotification] = useState<ChatNotification | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<"tasks" | "notes" | null>(null);

  // Rotate quotes every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setCurrentQuote(randomQuote);
      setShowQuote(true);
      
      // Hide quote after 10 seconds
      setTimeout(() => setShowQuote(false), 10000);
    }, 120000);

    // Show initial quote
    setTimeout(() => setShowQuote(false), 10000);

    return () => clearInterval(interval);
  }, []);

  // Simulate chat notifications (in production, this would come from Supabase realtime)
  useEffect(() => {
    if (!isPro) return;

    // Mock notification after 30 seconds
    const timeout = setTimeout(() => {
      setChatNotification({
        id: "1",
        text: "Keep going, you're doing great.",
        timestamp: new Date(),
      });

      // Clear notification after 5 seconds
      setTimeout(() => setChatNotification(null), 5000);
    }, 30000);

    return () => clearTimeout(timeout);
  }, [isPro]);

  const activeTask = tasks.find(t => t.isActive);
  const activeTasks = tasks.filter(t => t.isActive);
  const totalTasks = tasks.length;

  return (
    <>
      {/* Motivational Quote - Floating at bottom center */}
      <div 
        className={cn(
          "fixed bottom-24 left-1/2 -translate-x-1/2 z-20 transition-all duration-700",
          showQuote ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-card/60 backdrop-blur-xl border border-border/30">
          <Quote className="w-4 h-4 text-primary/60" />
          <span className="text-sm text-muted-foreground italic">{currentQuote}</span>
        </div>
      </div>

      {/* Chat Notification - Floating toast */}
      {chatNotification && isPro && (
        <div className="fixed top-24 right-6 z-30 animate-fade-up">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 shadow-lg max-w-xs">
            <MessageCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Focus Room</p>
              <p className="text-sm text-foreground">{chatNotification.text}</p>
            </div>
            <button 
              onClick={() => setChatNotification(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Side panels - Tasks and Notes */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {/* Tasks mini panel */}
        {totalTasks > 0 && (
          <button
            onClick={() => setExpandedPanel(expandedPanel === "tasks" ? null : "tasks")}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
              expandedPanel === "tasks" 
                ? "bg-card/80 border-primary/30 backdrop-blur-xl" 
                : "bg-card/40 border-border/30 backdrop-blur-sm hover:bg-card/60"
            )}
          >
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {activeTasks.length}/{totalTasks}
            </span>
          </button>
        )}

        {/* Notes mini panel */}
        {notes && isPro && (
          <button
            onClick={() => setExpandedPanel(expandedPanel === "notes" ? null : "notes")}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
              expandedPanel === "notes" 
                ? "bg-card/80 border-primary/30 backdrop-blur-xl" 
                : "bg-card/40 border-border/30 backdrop-blur-sm hover:bg-card/60"
            )}
          >
            <FileText className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Expanded Tasks Panel */}
      {expandedPanel === "tasks" && totalTasks > 0 && (
        <div className="fixed left-16 top-1/2 -translate-y-1/2 z-20 w-64 animate-fade-in">
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tasks</p>
              <button 
                onClick={() => setExpandedPanel(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    task.isActive && "text-primary font-medium"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    task.isActive ? "bg-primary" : "bg-muted-foreground/30"
                  )} />
                  <span className="truncate">{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Notes Panel */}
      {expandedPanel === "notes" && notes && isPro && (
        <div className="fixed left-16 top-1/2 -translate-y-1/2 z-20 w-72 animate-fade-in">
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
              <button 
                onClick={() => setExpandedPanel(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {notes}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkingSessionOverlay;