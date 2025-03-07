import { games, players, type Game, type InsertGame, type Player, type InsertPlayer, type RankTier, rankTiers } from "@shared/schema";

export interface IStorage {
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  updateGame(id: number, updates: Partial<Game>): Promise<Game>;
  getPlayer(username: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerStats(username: string, result: 'win' | 'loss' | 'draw'): Promise<Player>;
}

export class MemStorage implements IStorage {
  private games: Map<number, Game>;
  private players: Map<string, Player>;
  private currentGameId: number;
  private currentPlayerId: number;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.currentGameId = 1;
    this.currentPlayerId = 1;
  }

  private calculateNewRank(player: Player): RankTier {
    const wins = player.wins;
    const winsForRank = [0, 2, 4, 8, 16, 32, 64, 128]; // Doubling win requirements

    let newRank = 'Bronze' as RankTier;
    for (let i = winsForRank.length - 1; i >= 0; i--) {
      if (wins >= winsForRank[i]) {
        newRank = rankTiers[i];
        break;
      }
    }

    return newRank;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = {
      ...insertGame,
      id,
      isFinished: false,
      result: null,
      whiteTimeLeft: 600,
      blackTimeLeft: 600,
      lastMoveTime: null
    };
    this.games.set(id, game);
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async updateGame(id: number, updates: Partial<Game>): Promise<Game> {
    const game = this.games.get(id);
    if (!game) {
      throw new Error("Game not found");
    }
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async getPlayer(username: string): Promise<Player | undefined> {
    return this.players.get(username);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = {
      ...insertPlayer,
      id,
      rank: 'Bronze',
      wins: 0,
      losses: 0,
      draws: 0,
      lastGameId: null
    };
    this.players.set(player.username, player);
    return player;
  }

  async updatePlayerStats(username: string, result: 'win' | 'loss' | 'draw'): Promise<Player> {
    const player = this.players.get(username);
    if (!player) {
      throw new Error("Player not found");
    }

    const updatedPlayer = {
      ...player,
      wins: player.wins + (result === 'win' ? 1 : 0),
      losses: player.losses + (result === 'loss' ? 1 : 0),
      draws: player.draws + (result === 'draw' ? 1 : 0),
    };

    // Calculate new rank
    updatedPlayer.rank = this.calculateNewRank(updatedPlayer);

    this.players.set(username, updatedPlayer);
    return updatedPlayer;
  }
}

export const storage = new MemStorage();