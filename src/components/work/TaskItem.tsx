import { GripVertical, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskCategory } from "./TaskPlanner";

interface TaskItemProps {
  task: Task;
  onToggleActive: (id: string) => void;
  onRemove: (id: string) => void;
  onCategoryChange: (id: string, category: TaskCategory) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isPro: boolean;
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

const TaskItem = ({ 
  task, 
  onToggleActive, 
  onRemove, 
  onCategoryChange,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isPro 
}: TaskItemProps) => {
  const categories: TaskCategory[] = ["deep", "support", "light"];

  const cycleCategory = () => {
    if (!isPro) return;
    const currentIndex = categories.indexOf(task.category);
    const nextIndex = (currentIndex + 1) % categories.length;
    onCategoryChange(task.id, categories[nextIndex]);
  };

  if (task.isActive) {
    return (
      <div
        className={cn(
          "group p-4 rounded-xl border transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5",
          CATEGORY_STYLES[task.category]
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle & reorder */}
          {isPro && (
            <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-60 transition-opacity">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-0.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <GripVertical className="w-4 h-4 text-muted-foreground/50" />
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className="p-0.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Category badge - clickable for Pro */}
            <button
              onClick={cycleCategory}
              disabled={!isPro}
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium mb-2 transition-all",
                CATEGORY_BADGE_STYLES[task.category],
                isPro && "hover:scale-105 cursor-pointer"
              )}
            >
              {CATEGORY_LABELS[task.category]}
            </button>
            <p className="text-sm font-medium leading-relaxed">{task.text}</p>
          </div>

          {/* Remove button */}
          <button
            onClick={() => onToggleActive(task.id)}
            className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-1 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Inactive task
  return (
    <div
      onClick={() => onToggleActive(task.id)}
      className="group flex items-center justify-between p-3 rounded-lg text-sm text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50 transition-all cursor-pointer"
    >
      <span className="truncate">{task.text}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(task.id);
        }}
        className="opacity-0 group-hover:opacity-50 hover:opacity-100 p-1 transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TaskItem;
