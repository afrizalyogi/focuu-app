export const quotes = [
  {
    text: "The successful warrior is the average man, with laser-like focus.",
    author: "Bruce Lee",
  },
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
  },
  {
    text: "Lack of direction, not lack of time, is the problem. We all have twenty-four hours days.",
    author: "Zig Ziglar",
  },
  {
    text: "It is not enough to be busy. So are the ants. The question is: What are we busy about?",
    author: "Henry David Thoreau",
  },
  {
    text: "Starve your distractions, feed your focus.",
    author: "Unknown",
  },
  {
    text: "Productivity is being able to do things that you were never able to do before.",
    author: "Franz Kafka",
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
  {
    text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.",
    author: "Leo Babauta",
  },
  {
    text: "You can do anything, but not everything.",
    author: "David Allen",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Your calm mind is the ultimate weapon against your challenges.",
    author: "Bryant McGill",
  },
  {
    text: "Focus is a muscle. The more you use it, the stronger it gets.",
    author: "Unknown",
  },
  {
    text: "Do the hard jobs first. The easy jobs will take care of themselves.",
    author: "Dale Carnegie",
  },
  {
    text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    author: "Stephen King",
  },
  {
    text: "Efficiency is doing things right; effectiveness is doing the right things.",
    author: "Peter Drucker",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "There is no substitute for hard work.",
    author: "Thomas Edison",
  },
  {
    text: "The secret to getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
  {
    text: "Deep work is crucial to mastery and efficiency.",
    author: "Cal Newport",
  },
  {
    text: "Flow is the state of total immersion in the task at hand.",
    author: "Mihaly Csikszentmihalyi",
  },
];

export const getRandomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};
