import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("p-4 rounded-xl bg-card/50 border border-border/30 space-y-3", className)}>
    <Skeleton className="h-4 w-24 bg-secondary" />
    <Skeleton className="h-8 w-full bg-secondary" />
    <Skeleton className="h-4 w-3/4 bg-secondary" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
    <Skeleton className="w-4 h-4 mx-auto mb-2 rounded bg-secondary" />
    <Skeleton className="h-8 w-12 mx-auto mb-1 bg-secondary" />
    <Skeleton className="h-3 w-8 mx-auto bg-secondary" />
  </div>
);

export const SessionRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-card/30 border border-border/20">
    <Skeleton className="h-5 w-20 bg-secondary" />
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-16 bg-secondary" />
      <Skeleton className="h-6 w-20 rounded-full bg-secondary" />
    </div>
  </div>
);

export const TaskItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
    <Skeleton className="w-5 h-5 rounded bg-secondary" />
    <Skeleton className="h-5 flex-1 bg-secondary" />
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="flex items-start gap-2 mb-2">
    <Skeleton className="h-3 w-10 bg-secondary/50" />
    <Skeleton className="h-4 w-3/4 bg-secondary/50" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
      <Skeleton className="h-5 w-16 bg-secondary" />
      <Skeleton className="h-4 w-32 bg-secondary" />
    </div>
    <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
      <Skeleton className="h-5 w-12 bg-secondary" />
      <Skeleton className="h-6 w-12 rounded-full bg-secondary" />
    </div>
  </div>
);

export const SettingRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
    <div className="space-y-2">
      <Skeleton className="h-5 w-24 bg-secondary" />
      <Skeleton className="h-3 w-40 bg-secondary" />
    </div>
    <Skeleton className="h-6 w-10 rounded-full bg-secondary" />
  </div>
);

export const HistoryPageSkeleton = () => (
  <div className="animate-fade-up">
    <Skeleton className="h-8 w-48 mb-2 bg-secondary" />
    <Skeleton className="h-4 w-64 mb-10 bg-secondary" />
    
    <div className="grid grid-cols-3 gap-3 mb-12">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <SessionRowSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const SettingsPageSkeleton = () => (
  <div className="animate-fade-up space-y-8">
    <Skeleton className="h-8 w-24 bg-secondary" />
    
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-4 h-4 rounded bg-secondary" />
        <Skeleton className="h-4 w-16 bg-secondary" />
      </div>
      <ProfileSkeleton />
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-4 h-4 rounded bg-secondary" />
        <Skeleton className="h-4 w-16 bg-secondary" />
      </div>
      <SettingRowSkeleton />
    </div>
  </div>
);
