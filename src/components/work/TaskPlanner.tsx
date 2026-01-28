import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TaskCategory = "deep" | "support" | "light";

export interface Task {
  id: string;
  text: string;
  category: TaskCategory;
  isActive: boolean;
}

interface TaskPlannerProps {
  isPro: boolean;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onUpgradeClick: () => void;
}

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  deep: "Deep",
  support: "Support",
  light: "Light",
};

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  deep: "bg-primary/20 text-primary",
  support: "bg-secondary text-secondary-foreground",
  light: "bg-muted text-muted-foreground",
};

const TaskPlanner = ({ isPro, tasks, onTasksChange, onUpgradeClick }: TaskPlannerProps) => {
  const [newTaskText, setNewTaskText] = useState("");

  const activeTasks = tasks.filter(t => t.isActive);
  const maxActiveTasks = isPro ? 3 : 1;
  const canAddActiveTask = activeTasks.length < maxActiveTasks;

  const getNextCategory = (): TaskCategory => {
    if (!isPro) return "deep";
    const activeCategories = activeTasks.map(t => t.category);
    if (!activeCategories.includes("deep")) return "deep";
    if (!activeCategories.includes("support")) return "support";
    return "light";
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      category: getNextCategory(),
      isActive: canAddActiveTask,
    };

    onTasksChange([...tasks, newTask]);
    setNewTaskText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  const toggleTaskActive = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.isActive) {
      // Deactivate
      onTasksChange(tasks.map(t => 
        t.id === taskId ? { ...t, isActive: false } : t
      ));
    } else {
      // Check if can activate
      if (!canAddActiveTask) {
        if (!isPro) {
          onUpgradeClick();
        }
        return;
      }
      onTasksChange(tasks.map(t => 
        t.id === taskId ? { ...t, isActive: true, category: getNextCategory() } : t
      ));
    }
  };

  const removeTask = (taskId: string) => {
    onTasksChange(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Today's Tasks
        </p>
        {isPro ? (
          <p className="text-xs text-muted-foreground">
            {activeTasks.length}/3 active
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Focus on one thing first.
          </p>
        )}
      </div>

      {/* Active Tasks - Bento Style for Pro */}
      {activeTasks.length > 0 && (
        <div className={cn(
          "grid gap-2",
          isPro && activeTasks.length > 1 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
        )}>
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-lg border border-border/50 transition-calm",
                CATEGORY_COLORS[task.category]
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider opacity-60">
                    {CATEGORY_LABELS[task.category]}
                  </span>
                  <p className="text-sm font-medium truncate">{task.text}</p>
                </div>
                <button
                  onClick={() => toggleTaskActive(task.id)}
                  className="text-xs opacity-50 hover:opacity-100 transition-calm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder={activeTasks.length === 0 ? "What will you work on?" : "Add another task..."}
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isPro && tasks.length >= 1}
          className={cn(
            "bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary pr-16",
            !isPro && tasks.length >= 1 && "opacity-50 cursor-not-allowed"
          )}
        />
        {newTaskText && (
          <button
            onClick={handleAddTask}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-calm"
          >
            Add
          </button>
        )}
      </div>

      {/* Inactive Tasks (greyed out) */}
      {tasks.filter(t => !t.isActive).length > 0 && (
        <div className="space-y-1">
          {tasks.filter(t => !t.isActive).map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskActive(task.id)}
              className="flex items-center justify-between p-2 rounded text-sm text-muted-foreground/50 hover:text-muted-foreground transition-calm cursor-pointer group"
            >
              <span className="truncate">{task.text}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTask(task.id);
                }}
                className="opacity-0 group-hover:opacity-50 hover:opacity-100 text-xs transition-calm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade hint for free users */}
      {!isPro && tasks.length >= 1 && (
        <button
          onClick={onUpgradeClick}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-calm"
        >
          More room with Pro →
        </button>
      )}
    </div>
  );
};

export default TaskPlanner;
