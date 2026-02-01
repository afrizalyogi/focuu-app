import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Quote,
  ListTodo,
  FileText,
  X,
  Plus,
  Check,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskCategory } from "./TaskPlanner";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { WORK_QUOTES, getRandomQuote } from "@/data/quotes";

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

const WorkingSessionOverlay = ({
  tasks,
  notes,
  isPro,
  onTasksChange,
}: WorkingSessionOverlayProps) => {
  const { user } = useAuth();
  const [chatNotification, setChatNotification] = useState<ChatMessage | null>(
    null,
  );
  const [expandedPanel, setExpandedPanel] = useState<
    "tasks" | "notes" | "chat" | null
  >(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [canSendChat, setCanSendChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages and subscribe to realtime
  useEffect(() => {
    if (!isPro) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);
      if (data) setChatMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel("overlay_chat_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setChatMessages((prev) => [...prev, newMsg]);

          // Show notification if panel is not open
          if (expandedPanel !== "chat") {
            setChatNotification(newMsg);
            setTimeout(() => setChatNotification(null), 5000);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isPro, expandedPanel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (expandedPanel === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, expandedPanel]);

  const handleSendChat = async () => {
    if (!newChatMessage.trim() || !canSendChat || !isPro || !user) return;

    const messageText = newChatMessage.trim().slice(0, 140);
    setNewChatMessage("");
    setCanSendChat(false);

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      message: messageText,
    });

    setTimeout(() => setCanSendChat(true), 120000);
  };

  const activeTask = tasks.find((t) => t.isActive);
  const activeTasks = tasks.filter((t) => t.isActive);
  const totalTasks = tasks.length;

  const handleAddTask = () => {
    if (!newTaskText.trim() || !onTasksChange) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      category: "light" as TaskCategory,
      priority: "medium", // Default priority
      isActive: false,
    };

    onTasksChange([...tasks, newTask]);
    setNewTaskText("");
  };

  const handleCompleteTask = (taskId: string) => {
    if (!onTasksChange) return;
    onTasksChange(tasks.filter((t) => t.id !== taskId));
  };

  const handleRemoveTask = (taskId: string) => {
    if (!onTasksChange) return;
    onTasksChange(tasks.filter((t) => t.id !== taskId));
  };

  const handleToggleActive = (taskId: string) => {
    if (!onTasksChange) return;
    const maxActive = isPro ? 3 : 1;
    const currentActive = activeTasks.length;
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;

    if (task.isActive) {
      onTasksChange(
        tasks.map((t) => (t.id === taskId ? { ...t, isActive: false } : t)),
      );
    } else if (currentActive < maxActive) {
      onTasksChange(
        tasks.map((t) => (t.id === taskId ? { ...t, isActive: true } : t)),
      );
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Side panels - Tasks, Notes, and Chat */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {/* Tasks mini panel MOVED TO DOCK */}
        {/* <button ... /> */}

        {/* Notes mini panel */}
        {notes && isPro && (
          <button
            onClick={() =>
              setExpandedPanel(expandedPanel === "notes" ? null : "notes")
            }
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
              expandedPanel === "notes"
                ? "bg-card/80 border-primary/30 backdrop-blur-xl"
                : "bg-card/40 border-border/30 backdrop-blur-sm hover:bg-card/60",
            )}
          >
            <FileText className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Expanded Tasks Panel - MOVED TO DOCK */}
      {/* {expandedPanel === "tasks" && ( ... )} */}

      {/* Expanded Notes Panel */}
      {expandedPanel === "notes" && notes && isPro && (
        <div className="fixed left-16 top-1/2 -translate-y-1/2 z-20 w-72 animate-fade-in">
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Notes
              </p>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Focus Room
              </p>
              <button
                onClick={() => setExpandedPanel(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="h-48 overflow-y-auto space-y-2 mb-3 pr-1">
              {chatMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-8">
                  No messages yet
                </p>
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
                onChange={(e) =>
                  setNewChatMessage(e.target.value.slice(0, 140))
                }
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
