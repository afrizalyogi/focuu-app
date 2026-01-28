import { useState, useEffect, useRef } from "react";
import { MessageCircle, Quote, ListTodo, FileText, X, Plus, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskCategory } from "./TaskPlanner";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

interface WorkingSessionOverlayProps {
  tasks: Task[];
  notes: string;
  isPro: boolean;
  onTasksChange?: (tasks: Task[]) => void;
}

const WorkingSessionOverlay = ({ tasks, notes, isPro, onTasksChange }: WorkingSessionOverlayProps) => {
  const { user } = useAuth();
  const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
  const [showQuote, setShowQuote] = useState(true);
  const [chatNotification, setChatNotification] = useState<ChatMessage | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<"tasks" | "notes" | "chat" | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [canSendChat, setCanSendChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch chat messages and subscribe to realtime
  useEffect(() => {
    if (!isPro) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setChatMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('overlay_chat_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setChatMessages((prev) => [...prev, newMsg]);
          
          // Show notification if panel is not open
          if (expandedPanel !== "chat") {
            setChatNotification(newMsg);
            setTimeout(() => setChatNotification(null), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isPro, expandedPanel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (expandedPanel === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, expandedPanel]);

  const handleSendChat = async () => {
    if (!newChatMessage.trim() || !canSendChat || !isPro || !user) return;
    
    const messageText = newChatMessage.trim().slice(0, 140);
    setNewChatMessage("");
    setCanSendChat(false);

    await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message: messageText,
      });

    setTimeout(() => setCanSendChat(true), 120000);
  };

  const activeTask = tasks.find(t => t.isActive);
  const activeTasks = tasks.filter(t => t.isActive);
  const totalTasks = tasks.length;

  const handleAddTask = () => {
    if (!newTaskText.trim() || !onTasksChange) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      category: "light" as TaskCategory,
      isActive: false,
    };

    onTasksChange([...tasks, newTask]);
    setNewTaskText("");
  };

  const handleCompleteTask = (taskId: string) => {
    if (!onTasksChange) return;
    onTasksChange(tasks.filter(t => t.id !== taskId));
  };

  const handleRemoveTask = (taskId: string) => {
    if (!onTasksChange) return;
    onTasksChange(tasks.filter(t => t.id !== taskId));
  };

  const handleToggleActive = (taskId: string) => {
    if (!onTasksChange) return;
    const maxActive = isPro ? 3 : 1;
    const currentActive = activeTasks.length;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    if (task.isActive) {
      onTasksChange(tasks.map(t => t.id === taskId ? { ...t, isActive: false } : t));
    } else if (currentActive < maxActive) {
      onTasksChange(tasks.map(t => t.id === taskId ? { ...t, isActive: true } : t));
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
      {chatNotification && isPro && expandedPanel !== "chat" && (
        <div className="fixed top-24 right-6 z-30 animate-fade-up">
          <div 
            className="flex items-start gap-3 p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 shadow-lg max-w-xs cursor-pointer"
            onClick={() => setExpandedPanel("chat")}
          >
            <MessageCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Focus Room</p>
              <p className="text-sm text-foreground">{chatNotification.message}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setChatNotification(null);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Side panels - Tasks, Notes, and Chat */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {/* Tasks mini panel */}
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
            {activeTasks.length}/{totalTasks || 0}
          </span>
        </button>

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

        {/* Chat mini panel */}
        {isPro && (
          <button
            onClick={() => setExpandedPanel(expandedPanel === "chat" ? null : "chat")}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
              expandedPanel === "chat" 
                ? "bg-card/80 border-primary/30 backdrop-blur-xl" 
                : "bg-card/40 border-border/30 backdrop-blur-sm hover:bg-card/60"
            )}
          >
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Expanded Tasks Panel */}
      {expandedPanel === "tasks" && (
        <div className="fixed left-16 top-1/2 -translate-y-1/2 z-20 w-72 animate-fade-in">
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
            
            {/* Add new task */}
            {onTasksChange && (
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="h-8 text-xs bg-secondary/50 border-border/50"
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskText.trim()}
                  className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-4">No tasks yet</p>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 text-sm group",
                      task.isActive && "text-primary font-medium"
                    )}
                  >
                    <button
                      onClick={() => handleToggleActive(task.id)}
                      className={cn(
                        "w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-all",
                        task.isActive 
                          ? "border-primary bg-primary/20" 
                          : "border-muted-foreground/30 hover:border-primary/50"
                      )}
                    >
                      {task.isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                    <span className="truncate flex-1">{task.text}</span>
                    {onTasksChange && (
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                          title="Complete"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveTask(task.id)}
                          className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
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

      {/* Expanded Chat Panel */}
      {expandedPanel === "chat" && isPro && (
        <div className="fixed left-16 top-1/2 -translate-y-1/2 z-20 w-80 animate-fade-in">
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Focus Room</p>
              <button 
                onClick={() => setExpandedPanel(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="h-48 overflow-y-auto space-y-2 mb-3 pr-1">
              {chatMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-8">No messages yet</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm text-foreground/80">
                    <span className="text-muted-foreground/40 text-xs mr-2">
                      {formatTime(msg.created_at)}
                    </span>
                    {msg.message}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="relative">
              <Input
                type="text"
                placeholder={canSendChat ? "Encourage..." : "Slow mode..."}
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value.slice(0, 140))}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                disabled={!canSendChat || !user}
                className="h-8 text-xs bg-secondary/50 border-border/50 pr-12"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50">
                {newChatMessage.length}/140
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkingSessionOverlay;
