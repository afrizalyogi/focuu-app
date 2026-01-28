interface OutsideHoursMessageProps {
  workHoursStart: string;
  workHoursEnd: string;
}

const OutsideHoursMessage = ({ workHoursStart, workHoursEnd }: OutsideHoursMessageProps) => {
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-up text-center">
      <div>
        <p className="text-2xl md:text-3xl font-medium text-foreground mb-2">
          focuu is off right now
        </p>
        <p className="text-muted-foreground">
          You set work hours from {workHoursStart} to {workHoursEnd}.
        </p>
      </div>
      <p className="text-sm text-muted-foreground/70 max-w-xs">
        Rest is part of the work. Come back during your hours.
      </p>
    </div>
  );
};

export default OutsideHoursMessage;
