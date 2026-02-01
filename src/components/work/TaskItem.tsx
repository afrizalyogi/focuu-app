import { useState, useRef, useEffect } from "react";
import { GripVertical, X, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskCategory } from "./TaskPlanner";

interface TaskItemProps {
  task: Task;
  onToggleActive: (id: string) => void;
  onRemove: (id: string) => void;
  onCategoryChange: (id: string, category: TaskCategory) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetTaskId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  isPro: boolean;
  isDragging?: boolean;
}

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  deep: "Deep",
  support: "Support",
  light: "Light",
};

const CATEGORY_STYLES: Record<TaskCategory, string> = {
  deep: "bg-primary/20 text-primary border-primary/30",
  support: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  light: "bg-muted text-muted-foreground border-border",
};

const CATEGORY_BADGE_STYLES: Record<TaskCategory, string> = {
  deep: "bg-primary/30 text-primary",
  support: "bg-yellow-500/30 text-yellow-400",
  light: "bg-muted-foreground/20 text-muted-foreground",
};

const PRIORITY_COLORS = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const TaskItem = ({
  task,
  onToggleActive,
  onRemove,
  onCategoryChange,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isFirst,
  isLast,
  isPro,
  isDragging = false,
}: TaskItemProps & {
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const priorities: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPro || !onUpdate) return;
    const currentIndex = priorities.indexOf(task.priority || "medium");
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdate(task.id, { priority: priorities[nextIndex] });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isPro || !onDragStart) return;
    onDragStart(e, task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isPro || !onDragOver) return;
    e.preventDefault();
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isPro || !onDrop) return;
    e.preventDefault();
    onDrop(e, task.id);
  };

  const saveEdit = () => {
    if (editText.trim() && onUpdate) {
      onUpdate(task.id, { text: editText.trim() });
    } else {
      setEditText(task.text); // Revert
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (task.isActive) {
    return (
      <div
        draggable={isPro && !isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "group p-4 rounded-xl border transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5",
          // Use priority color if available, else category fallback?
          // Actually, let's use Priority color for border/bg hint
          task.priority === "high"
            ? "border-red-500/20 bg-red-500/5"
            : task.priority === "medium"
              ? "border-yellow-500/20 bg-yellow-500/5"
              : "border-blue-500/20 bg-blue-500/5",
          isDragging && "opacity-50",
          isPro && !isEditing && "cursor-grab active:cursor-grabbing",
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle & reorder */}
          {isPro && !isEditing && (
            <div className="flex flex-col items-center gap-0.5 opacity-40 group-hover:opacity-60 transition-opacity pt-1">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-0.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <GripVertical className="w-4 h-4 text-muted-foreground/50" />
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className="p-0.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Priority Badge */}
              <button
                onClick={cyclePriority}
                disabled={!isPro}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all duration-300",
                  PRIORITY_COLORS[task.priority || "medium"],
                  isPro &&
                    "hover:scale-105 cursor-pointer hover:brightness-110 active:scale-95",
                )}
                title={isPro ? "Click to change priority" : "Priority"}
              >
                {task.priority || "medium"}
              </button>
              {task.priority === "high" && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>

            {isEditing ? (
              <input
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none p-0 text-sm font-medium focus:outline-none focus:ring-0"
              />
            ) : (
              <div className="relative group/text">
                <p
                  className="text-sm font-medium leading-relaxed cursor-text selection:bg-primary/20"
                  onDoubleClick={() => {
                    if (isPro) setIsEditing(true);
                  }}
                >
                  {task.text}
                </p>
                {isPro && (
                  <span className="absolute -top-3 left-0 text-[9px] text-muted-foreground/0 group-hover/text:text-muted-foreground/70 transition-all pointer-events-none bg-background/80 px-1 rounded">
                    Double-click to edit
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Edit Button (Mobile friendly) */}
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="Edit Task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            {/* Remove button */}
            <button
              onClick={() => onToggleActive(task.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              title="Move to Backlog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inactive task
  return (
    <div
      onClick={(e) => {
        // Prevent toggling if clicking edit/delete
        if ((e.target as HTMLElement).closest("button")) return;
        onToggleActive(task.id);
      }}
      className="group flex items-center justify-between p-3 rounded-lg text-sm text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            task.priority === "high"
              ? "bg-red-500/50"
              : task.priority === "low"
                ? "bg-blue-500/50"
                : "bg-yellow-500/50",
          )}
        />
        <span className="truncate">{task.text}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(task.id);
        }}
        className="opacity-0 group-hover:opacity-50 hover:opacity-100 p-1 transition-all text-muted-foreground hover:text-destructive"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TaskItem;
