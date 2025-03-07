import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertGameSchema, moveSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.post("/api/games", async (req, res) => {
    const parsed = insertGameSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid game data" });
    }
    const game = await storage.createGame(parsed.data);
    res.json(game);
  });

  app.get("/api/games/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const game = await storage.getGame(id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  });

  app.post("/api/games/:id/move", async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = moveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid move" });
    }

    const game = await storage.getGame(id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Game state updates handled by frontend
    res.json({ success: true });
  });

  return httpServer;
}
