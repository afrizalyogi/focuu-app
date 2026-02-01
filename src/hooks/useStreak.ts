import { useMemo } from "react";
import { useSessionHistory } from "./useSessionHistory";

export const useStreak = () => {
  const { sessions } = useSessionHistory();

  const streak = useMemo(() => {
    if (!sessions || sessions.length === 0) return 0;

    // Get unique dates
    const uniqueDates = Array.from(new Set(sessions.map((s) => s.date)))
      .sort()
      .reverse();

    if (uniqueDates.length === 0) return 0;

    // Check if today or yesterday is present to start streak
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // If no session today OR yesterday, streak is broken (0), unless we want to be lenient
    // For "current streak", it should probably include today or be 0 if yesterday logic failed?
    // Let's iterate.

    let currentStreak = 0;
    const expectedDate = new Date(); // Start checking from Today
    const expectedStr = expectedDate.toISOString().split("T")[0];

    // Optimization: find start index
    // If most recent date is today, start counting.
    // If most recent date is yesterday, start counting.
    // If most recent date is older, streak is 0.

    const latestDate = uniqueDates[0];
    if (latestDate !== today && latestDate !== yesterday) {
      return 0;
    }

    // Now count consecutive days backwards
    // We iterate uniqueDates.
    // We need to match precise dates.

    // Convert uniqueDates to Map for O(1) lookup or just iterate?
    // Since we reverse sorted, we can check sequentially.

    let checkDate = new Date();
    // Allow starting from Yesterday if Today is missing
    if (latestDate === yesterday) {
      checkDate = new Date(Date.now() - 86400000);
    }

    for (const dateStr of uniqueDates) {
      // While dateStr matches checkDate...
      // Wait, uniqueDates might have gaps?
      // No, we are iterating uniqueDates.
      // We need to ensure dateStr EQUALS checkDate string.

      while (true) {
        const checkStr = checkDate.toISOString().split("T")[0];
        if (dateStr === checkStr) {
          currentStreak++;
          // Move checkDate back
          checkDate.setDate(checkDate.getDate() - 1);
          break; // Found match, go to next uniqueDate
        } else if (dateStr < checkStr) {
          // dateStr is older than expected checkStr. Gap detected.
          // But wait, we might have skipped checking checkStr?
          // Example: unique [Today, DayMin2].
          // Loop 1: dateStr=Today. Match. checkDate becomes Yersterday.
          // Loop 2: dateStr=DayMin2. checkStr=Yesterday. Mismatch.
          return currentStreak;
        } else {
          // dateStr > checkStr. Impossible if sorted reverse and we started correctly.
          // Should not happen if logic is sound.
          return currentStreak;
        }
      }
    }

    return currentStreak;
  }, [sessions]);

  return { streak };
};
