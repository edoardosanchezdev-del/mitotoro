import quotes from '../data/quotes.json';

const getDayOfYear = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86_400_000);
};

export const quoteService = {
  getToday(date = new Date()) {
    const index = (getDayOfYear(date) - 1) % quotes.length;
    return {
      text: quotes[index],
      dayNumber: String(index + 1).padStart(3, '0'),
      total: quotes.length
    };
  }
};
