import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = [
  "Swift", "Clever", "Mighty", "Brave", "Silent", "Wise", "Royal", "Ancient",
  "Noble", "Epic", "Grand", "Hidden", "Lucky", "Magic", "Quick", "Sharp"
];

const chessTerms = [
  "Knight", "Bishop", "Rook", "King", "Queen", "Pawn", "Master", "Champion",
  "Player", "Tactician", "Warrior", "Legend", "Prodigy", "Genius", "Strategist"
];

export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const chessTerm = chessTerms[Math.floor(Math.random() * chessTerms.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${chessTerm}${number}`;
}

// Helper function to sleep for animations
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));