import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rankTiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Champion', 'Unreal'] as const;
export type RankTier = typeof rankTiers[number];

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  fen: text("fen").notNull(),
  playerColor: text("player_color").notNull(),
  difficulty: integer("difficulty").notNull(),
  isFinished: boolean("is_finished").notNull().default(false),
  result: text("result"),
  whiteTimeLeft: integer("white_time_left").notNull().default(600), // 10 minutes in seconds
  blackTimeLeft: integer("black_time_left").notNull().default(600),
  lastMoveTime: integer("last_move_time"), // timestamp of last move
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  rank: text("rank").notNull().default('Bronze'),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  lastGameId: integer("last_game_id"),
});

export const insertGameSchema = createInsertSchema(games).pick({
  fen: true,
  playerColor: true,
  difficulty: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  username: true,
});

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export const moveSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export type Move = z.infer<typeof moveSchema>;