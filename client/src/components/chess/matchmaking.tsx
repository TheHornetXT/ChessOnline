import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { generateUsername, sleep } from "@/lib/utils";

interface MatchmakingProps {
  onMatchFound: (username: string, playerColor: "w" | "b") => void;
}

export default function Matchmaking({ onMatchFound }: MatchmakingProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchDots, setSearchDots] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchDots(dots => dots.length >= 3 ? "" : dots + ".");
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const findGame = async () => {
    setIsSearching(true);
    const generatedUsername = generateUsername();
    setUsername(generatedUsername);

    // Simulate searching animation
    await sleep(2000);

    // Randomly assign color
    const color = Math.random() > 0.5 ? "w" : "b";
    onMatchFound(generatedUsername, color);
    setIsSearching(false);
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="pt-6">
        {isSearching ? (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">
              Finding a game{searchDots}
            </p>
            {username && (
              <p className="text-sm text-muted-foreground">
                Playing as {username}
              </p>
            )}
          </div>
        ) : (
          <Button 
            className="w-full text-lg py-6" 
            onClick={findGame}
          >
            Find Game
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
