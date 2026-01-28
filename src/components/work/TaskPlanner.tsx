import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import TaskItem from "./TaskItem";

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

const TaskPlanner = ({ isPro, tasks, onTasksChange, onUpgradeClick }: TaskPlannerProps) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const activeTasks = tasks.filter(t => t.isActive);
  const inactiveTasks = tasks.filter(t => !t.isActive);
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
      onTasksChange(tasks.map(t => 
        t.id === taskId ? { ...t, isActive: false } : t
      ));
    } else {
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

  const changeCategory = (taskId: string, category: TaskCategory) => {
    onTasksChange(tasks.map(t => 
      t.id === taskId ? { ...t, category } : t
    ));
  };

  const moveTask = (taskId: string, direction: "up" | "down") => {
    const activeTaskIds = activeTasks.map(t => t.id);
    const currentIndex = activeTaskIds.indexOf(taskId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= activeTaskIds.length) return;

    // Swap positions
    const newActiveTaskIds = [...activeTaskIds];
    [newActiveTaskIds[currentIndex], newActiveTaskIds[newIndex]] = 
    [newActiveTaskIds[newIndex], newActiveTaskIds[currentIndex]];

    // Reorder tasks array
    const reorderedTasks = [
      ...newActiveTaskIds.map(id => tasks.find(t => t.id === id)!),
      ...inactiveTasks,
    ];
    onTasksChange(reorderedTasks);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      return;
    }

    const activeTaskIds = activeTasks.map(t => t.id);
    const draggedIndex = activeTaskIds.indexOf(draggedTaskId);
    const targetIndex = activeTaskIds.indexOf(targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTaskId(null);
      return;
    }

    // Reorder
    const newActiveTaskIds = [...activeTaskIds];
    newActiveTaskIds.splice(draggedIndex, 1);
    newActiveTaskIds.splice(targetIndex, 0, draggedTaskId);

    const reorderedTasks = [
      ...newActiveTaskIds.map(id => tasks.find(t => t.id === id)!),
      ...inactiveTasks,
    ];
    onTasksChange(reorderedTasks);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <div className="w-full space-y-4 p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Today's Focus
        </p>
        {isPro ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i < activeTasks.length ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {activeTasks.length}/3
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">
            One thing at a time
          </p>
        )}
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-2" onDragEnd={handleDragEnd}>
          {activeTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleActive={toggleTaskActive}
              onRemove={removeTask}
              onCategoryChange={changeCategory}
              onMoveUp={() => moveTask(task.id, "up")}
              onMoveDown={() => moveTask(task.id, "down")}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isFirst={index === 0}
              isLast={index === activeTasks.length - 1}
              isPro={isPro}
              isDragging={draggedTaskId === task.id}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {activeTasks.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground/60 text-sm mb-2">
            What will you focus on today?
          </p>
        </div>
      )}

      {/* Task Input */}
      <div className="relative group">
        <Input
          type="text"
          placeholder={activeTasks.length === 0 ? "Add your main task..." : "Add another task..."}
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-secondary/50 border border-border/50 focus-visible:ring-1 focus-visible:ring-primary pr-12 transition-all",
            "placeholder:text-muted-foreground/40"
          )}
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskText.trim()}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all",
            newTaskText.trim() 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-muted-foreground/40"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Inactive Tasks */}
      {inactiveTasks.length > 0 && (
        <div className="pt-2 border-t border-border/20">
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">
            Backlog
          </p>
          <div className="space-y-0.5">
            {inactiveTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleActive={toggleTaskActive}
                onRemove={removeTask}
                onCategoryChange={changeCategory}
                isPro={isPro}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upgrade hint for free users */}
      {!isPro && tasks.length >= 1 && activeTasks.length === 1 && (
        <div className="pt-3 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground/40 leading-relaxed">
            Complete this first.
            <button
              onClick={onUpgradeClick}
              className="block w-full mt-1 text-primary/60 hover:text-primary transition-calm"
            >
              Need more? Go Pro.
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskPlanner;
