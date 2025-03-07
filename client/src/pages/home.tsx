import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chess } from "chess.js";
import Board from "@/components/chess/board";
import Controls from "@/components/chess/controls";
import { calculateBestMove } from "@/lib/chess-engine";
import { useToast } from "@/hooks/use-toast";
import Timer from "@/components/chess/timer";
import Matchmaking from "@/components/chess/matchmaking";
import { generateUsername } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Crown, Swords } from "lucide-react";
import { rankTiers } from "@shared/schema";
import React from "react";

const rankIcons = {
  Bronze: Trophy,
  Silver: Award,
  Gold: Award,
  Platinum: Crown,
  Diamond: Crown,
  Elite: Crown,
  Champion: Swords,
  Unreal: Swords,
};

const rankColors = {
  Bronze: "text-orange-600",
  Silver: "text-gray-400",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-400",
  Diamond: "text-blue-400",
  Elite: "text-purple-400",
  Champion: "text-red-400",
  Unreal: "text-fuchsia-400",
};

export default function Home() {
  const [game, setGame] = useState(() => new Chess());
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [username, setUsername] = useState("");
  const [aiUsername, setAiUsername] = useState("");
  const [playerRank, setPlayerRank] = useState("Bronze");
  const [aiRank, setAiRank] = useState("Bronze");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const { toast } = useToast();

  useEffect(() => {
    // Load saved username and rank from localStorage
    const savedUsername = localStorage.getItem("username");
    const savedRank = localStorage.getItem("rank");
    if (savedUsername) setUsername(savedUsername);
    if (savedRank) setPlayerRank(savedRank);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !game.isGameOver()) {
      interval = setInterval(() => {
        if (game.turn() === 'w') {
          setWhiteTime(prev => {
            if (prev <= 0) {
              handleTimeout('w');
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime(prev => {
            if (prev <= 0) {
              handleTimeout('b');
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, game]);

  useEffect(() => {
    let moveTimeout: NodeJS.Timeout;

    if (isGameStarted && game.turn() !== playerColor && !game.isGameOver()) {
      const aiGame = new Chess(game.fen());
      // Calculate AI difficulty based on rank
      const rankIndex = rankTiers.indexOf(aiRank);
      const difficulty = Math.min(Math.floor(rankIndex / 2) + 1, 4);
      const bestMove = calculateBestMove(aiGame, difficulty);

      if (bestMove) {
        moveTimeout = setTimeout(() => {
          const updatedGame = new Chess(game.fen());
          updatedGame.move(bestMove);
          setGame(new Chess(updatedGame.fen()));

          if (updatedGame.isCheckmate()) {
            handleGameEnd(playerColor === 'w' ? 'loss' : 'win');
          } else if (updatedGame.isDraw()) {
            handleGameEnd('draw');
          }
        }, 500);
      }
    }

    return () => clearTimeout(moveTimeout);
  }, [game, playerColor, aiRank, isGameStarted]);

  const handleGameEnd = (result: 'win' | 'loss' | 'draw') => {
    setIsTimerRunning(false);

    // Update wins/losses in localStorage
    const currentWins = parseInt(localStorage.getItem("wins") || "0");
    const newWins = currentWins + (result === 'win' ? 1 : 0);
    localStorage.setItem("wins", newWins.toString());

    // Calculate new rank based on wins
    const winsForRank = [0, 2, 4, 8, 16, 32, 64, 128]; // Doubling win requirements
    let newRankIndex = 0;

    for (let i = winsForRank.length - 1; i >= 0; i--) {
      if (newWins >= winsForRank[i]) {
        newRankIndex = i;
        break;
      }
    }

    const newRank = rankTiers[newRankIndex];
    setPlayerRank(newRank);
    localStorage.setItem("rank", newRank);

    toast({
      title: result === 'draw' ? "Draw!" : `${result === 'win' ? 'Victory!' : 'Defeat!'}`,
      description: result === 'draw'
        ? "Game ended in a draw"
        : `${result === 'win' ? 'Congratulations!' : 'Better luck next time!'}`
    });

    // Return to main menu after a short delay
    setTimeout(() => {
      setIsGameStarted(false);
    }, 2000);
  };

  const handleTimeout = (color: 'w' | 'b') => {
    setIsTimerRunning(false);
    toast({
      title: "Time's up!",
      description: `${color === 'w' ? 'Black' : 'White'} wins on time!`
    });
  };

  const makeMove = async (from: string, to: string) => {
    try {
      if (!isGameStarted) return;

      // Start timer on first move
      if (!isTimerRunning) {
        setIsTimerRunning(true);
      }

      // Only allow moves if it's player's turn
      if (game.turn() !== playerColor) {
        toast({
          variant: "destructive",
          title: "Not your turn",
          description: "Please wait for the AI to move"
        });
        return;
      }

      const updatedGame = new Chess(game.fen());
      const move = updatedGame.move({ from, to, promotion: "q" });

      if (move) {
        setGame(updatedGame);

        if (updatedGame.isCheckmate()) {
          setIsTimerRunning(false);
          handleGameEnd(playerColor === 'w' ? 'loss' : 'win');
        } else if (updatedGame.isDraw()) {
          setIsTimerRunning(false);
          handleGameEnd('draw');
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid move",
        description: "That move is not allowed"
      });
    }
  };

  const handleMatchFound = (matchUsername: string, color: "w" | "b") => {
    if (!username) {
      setUsername(matchUsername);
      localStorage.setItem("username", matchUsername);
    }

    // Generate AI username and rank
    const generatedAiUsername = generateUsername();
    const playerRankIndex = rankTiers.indexOf(playerRank);
    const aiRankIndex = Math.min(
      Math.max(0, playerRankIndex + Math.floor(Math.random() * 3) - 1),
      rankTiers.length - 1
    );
    const generatedAiRank = rankTiers[aiRankIndex];

    setAiUsername(generatedAiUsername);
    setAiRank(generatedAiRank);
    setPlayerColor(color);

    const newGame = new Chess();
    setGame(newGame);
    setWhiteTime(600);
    setBlackTime(600);
    setIsTimerRunning(false);
    setIsGameStarted(true);

    toast({
      title: "Match Found!",
      description: `Playing against ${generatedAiUsername} (${generatedAiRank})`
    });

    if (color === 'b') {
      const aiGame = new Chess();
      const bestMove = calculateBestMove(aiGame, Math.floor(aiRankIndex / 2) + 1);
      if (bestMove) {
        setTimeout(() => {
          newGame.move(bestMove);
          setGame(new Chess(newGame.fen()));
        }, 500);
      }
    }
  };

  const calculateProgress = () => {
    const currentRankIndex = rankTiers.indexOf(playerRank);
    const wins = parseInt(localStorage.getItem("wins") || "0");
    const winsForCurrentRank = [0, 2, 4, 8, 16, 32, 64, 128][currentRankIndex];
    const winsForNextRank = [0, 2, 4, 8, 16, 32, 64, 128][currentRankIndex + 1] || 128;

    // Calculate progress to next rank
    const progressWins = wins - winsForCurrentRank;
    const winsNeeded = winsForNextRank - winsForCurrentRank;
    return Math.min((progressWins / winsNeeded) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {!isGameStarted ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {username ? (
                    <>
                      <span>{username}</span>
                      <div className={`flex items-center gap-2 ${rankColors[playerRank]}`}>
                        {rankIcons[playerRank] && React.createElement(rankIcons[playerRank], { className: "w-6 h-6" })}
                        <span className="font-bold">{playerRank}</span>
                      </div>
                    </>
                  ) : (
                    "Welcome to Chess!"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Your Rank</h3>
                    <div className={`text-2xl font-bold ${rankColors[playerRank]}`}>
                      {playerRank}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Next Rank</h3>
                    <div className={`text-2xl font-bold ${
                      rankColors[rankTiers[Math.min(rankTiers.indexOf(playerRank) + 1, rankTiers.length - 1)]]
                    }`}>
                      {rankTiers[Math.min(rankTiers.indexOf(playerRank) + 1, rankTiers.length - 1)]}
                    </div>
                    <div className="mt-2 bg-accent rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Progress: {Math.round(calculateProgress())}%
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Status</h3>
                    <div className="text-2xl font-bold text-primary">
                      {username ? "Ready" : "New Player"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Matchmaking onMatchFound={handleMatchFound} />
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <Timer time={blackTime} isActive={game.turn() === 'b' && isTimerRunning} />
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{playerColor === 'b' ? username : aiUsername}</span>
                      <span className={`font-bold ${rankColors[playerColor === 'b' ? playerRank : aiRank]}`}>
                        ({playerColor === 'b' ? playerRank : aiRank})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Timer time={whiteTime} isActive={game.turn() === 'w' && isTimerRunning} />
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{playerColor === 'w' ? username : aiUsername}</span>
                      <span className={`font-bold ${rankColors[playerColor === 'w' ? playerRank : aiRank]}`}>
                        ({playerColor === 'w' ? playerRank : aiRank})
                      </span>
                    </div>
                  </div>
                </div>
                <Board
                  position={game.fen()}
                  onMove={makeMove}
                  playerColor={playerColor}
                />
              </div>
              <div className="w-full lg:w-64">
                <Controls
                  onReset={() => setIsGameStarted(false)}
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}