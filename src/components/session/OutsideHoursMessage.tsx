interface OutsideHoursMessageProps {
  workHoursStart: string;
  workHoursEnd: string;
}

const OutsideHoursMessage = ({ workHoursStart, workHoursEnd }: OutsideHoursMessageProps) => {
  return (
    <div className="flex flex-col items-center gap-8 animate-fade-up text-center">
      <div>
        <p className="text-2xl md:text-3xl font-medium text-foreground mb-3">
          focuu is resting
        </p>
        <p className="text-muted-foreground">
          Your work hours are {workHoursStart} to {workHoursEnd}.
        </p>
      </div>
      <p className="text-sm text-muted-foreground/60 max-w-xs leading-relaxed">
        Rest is part of the work. Come back during your hours, or turn off boundaries in settings.
      </p>
    </div>
  );
};

export default OutsideHoursMessage;
