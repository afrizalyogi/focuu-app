// Quotes organized by tone/pressure preference
// Based on onboarding pressure_preference: push, steady, support

export interface Quote {
  text: string;
  author?: string;
  tone: "push" | "steady" | "support" | "all";
}

export const quotes: Quote[] = [
  // PUSH - Direct, no-nonsense, challenging
  { text: "The work won't do itself.", tone: "push" },
  { text: "Stop thinking. Start doing.", tone: "push" },
  { text: "Discipline beats motivation.", tone: "push" },
  { text: "No one cares. Work harder.", tone: "push" },
  { text: "Results require action.", tone: "push" },
  { text: "Less talk. More work.", tone: "push" },
  { text: "Excuses won't get you there.", tone: "push" },
  { text: "Your future self will thank you.", tone: "push" },
  { text: "Get uncomfortable.", tone: "push" },
  { text: "The best time was yesterday. The next best time is now.", tone: "push" },
  { text: "Don't wish for it. Work for it.", tone: "push" },
  { text: "Hard choices, easy life.", tone: "push" },
  { text: "You're stronger than your excuses.", tone: "push" },
  { text: "Comfort is the enemy of progress.", tone: "push" },
  { text: "Move. Now.", tone: "push" },
  
  // STEADY - Grounded, neutral, practical
  { text: "One thing at a time.", tone: "steady" },
  { text: "Progress happens in the present.", tone: "steady" },
  { text: "Focus on what you can control.", tone: "steady" },
  { text: "Small steps lead to big changes.", tone: "steady" },
  { text: "Consistency compounds.", tone: "steady" },
  { text: "Show up. Do the work. Repeat.", tone: "steady" },
  { text: "Trust the process.", tone: "steady" },
  { text: "This moment is all you have.", tone: "steady" },
  { text: "Do what needs to be done.", tone: "steady" },
  { text: "Keep moving forward.", tone: "steady" },
  { text: "Action creates clarity.", tone: "steady" },
  { text: "Simple is effective.", tone: "steady" },
  { text: "Stay the course.", tone: "steady" },
  { text: "One session at a time.", tone: "steady" },
  { text: "The path is made by walking.", tone: "steady" },
  { text: "Work, then rest.", tone: "steady" },
  { text: "Begin with what's in front of you.", tone: "steady" },
  
  // SUPPORT - Gentle, affirming, permission-based
  { text: "You're here. That's enough.", tone: "support" },
  { text: "It's okay to go slow.", tone: "support" },
  { text: "You're doing better than you think.", tone: "support" },
  { text: "Be gentle with yourself.", tone: "support" },
  { text: "Every small effort counts.", tone: "support" },
  { text: "You don't need to be perfect.", tone: "support" },
  { text: "Rest when you need to.", tone: "support" },
  { text: "Your presence here matters.", tone: "support" },
  { text: "Take it one breath at a time.", tone: "support" },
  { text: "You're allowed to struggle.", tone: "support" },
  { text: "Progress isn't always visible.", tone: "support" },
  { text: "Be kind to yourself today.", tone: "support" },
  { text: "You've already started. That's brave.", tone: "support" },
  { text: "It's okay if today is hard.", tone: "support" },
  { text: "You're not behind.", tone: "support" },
  { text: "Showing up is an act of courage.", tone: "support" },
  { text: "You're doing something meaningful.", tone: "support" },
  { text: "This too shall pass.", tone: "support" },
  
  // ALL - Universal quotes that work for any preference
  { text: "The work is the path.", tone: "all" },
  { text: "Be where your feet are.", tone: "all" },
  { text: "This is the moment.", tone: "all" },
  { text: "Let everything else fade.", tone: "all" },
  { text: "Presence is power.", tone: "all" },
  { text: "Focus is a practice.", tone: "all" },
  { text: "Work, quietly.", tone: "all" },
  { text: "You're not alone in this.", tone: "all" },
  { text: "Deep work, deep progress.", tone: "all" },
  { text: "The only way out is through.", tone: "all" },
];

// Energy-specific quotes
export const energyQuotes: Record<string, Quote[]> = {
  low: [
    { text: "Low energy is still energy.", tone: "all" },
    { text: "Even 15 minutes matters.", tone: "all" },
    { text: "Start small. Start now.", tone: "all" },
    { text: "Something is better than nothing.", tone: "all" },
    { text: "Honor your current capacity.", tone: "support" },
  ],
  okay: [
    { text: "Steady wins.", tone: "all" },
    { text: "You've got enough.", tone: "all" },
    { text: "Keep the rhythm.", tone: "all" },
    { text: "This is your pace.", tone: "all" },
  ],
  high: [
    { text: "Channel this energy.", tone: "all" },
    { text: "Go deep.", tone: "all" },
    { text: "This is your moment.", tone: "all" },
    { text: "Make it count.", tone: "push" },
    { text: "Ride the wave.", tone: "all" },
  ],
};

// Get a random quote based on preferences
export const getQuote = (
  tonePreference?: "push" | "steady" | "support",
  energyLevel?: "low" | "okay" | "high"
): Quote => {
  let pool: Quote[] = [];
  
  // Add tone-specific quotes
  if (tonePreference) {
    pool = pool.concat(quotes.filter(q => q.tone === tonePreference || q.tone === "all"));
  } else {
    pool = quotes.filter(q => q.tone === "all" || q.tone === "steady");
  }
  
  // Add energy-specific quotes
  if (energyLevel && energyQuotes[energyLevel]) {
    pool = pool.concat(energyQuotes[energyLevel]);
  }
  
  // Return random quote from pool
  return pool[Math.floor(Math.random() * pool.length)];
};

// Get multiple unique quotes
export const getQuotes = (
  count: number,
  tonePreference?: "push" | "steady" | "support",
  energyLevel?: "low" | "okay" | "high"
): Quote[] => {
  let pool: Quote[] = [];
  
  if (tonePreference) {
    pool = pool.concat(quotes.filter(q => q.tone === tonePreference || q.tone === "all"));
  } else {
    pool = [...quotes];
  }
  
  if (energyLevel && energyQuotes[energyLevel]) {
    pool = pool.concat(energyQuotes[energyLevel]);
  }
  
  // Shuffle and take first N
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
