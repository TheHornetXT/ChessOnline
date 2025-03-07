import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ControlsProps {
  onReset: () => void;
}

export default function Controls({ onReset }: ControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={onReset}>
          <Search className="w-4 h-4 mr-2" />
          Find New Game
        </Button>
      </CardContent>
    </Card>
  );
}