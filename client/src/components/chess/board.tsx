import { useMemo, useState } from "react";
import Piece from "./piece";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Chess, type Square } from "chess.js";

interface BoardProps {
  position: string;
  onMove: (from: string, to: string) => void;
  playerColor: "w" | "b";
}

export default function Board({ position, onMove, playerColor }: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const chess = useMemo(() => new Chess(position), [position]);

  const squares = useMemo(() => {
    const board = chess.board();
    const squares = board.map(rank => 
      rank.map(square => square ? (square.color + square.type) : null)
    );
    return playerColor === "w" ? squares : [...squares].reverse();
  }, [chess, playerColor]);

  const files = playerColor === "w" ? "abcdefgh" : "hgfedcba";
  const ranks = playerColor === "w" ? "87654321" : "12345678";

  // Get legal moves for the selected square
  const legalMoves = useMemo(() => {
    if (!selectedSquare) return new Set<string>();
    return new Set(
      chess.moves({ square: selectedSquare as Square, verbose: true })
        .map(move => move.to)
    );
  }, [selectedSquare, chess]);

  const handleSquareClick = (square: string) => {
    if (selectedSquare) {
      if (legalMoves.has(square)) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
      } else {
        setSelectedSquare(square);
      }
    } else {
      const piece = chess.get(square as Square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="aspect-square w-full">
        <div className="grid grid-cols-8 h-full">
          {squares.map((row, rankIndex) =>
            row.map((piece, fileIndex) => {
              const square = `${files[fileIndex]}${ranks[rankIndex]}`;
              const isDark = (rankIndex + fileIndex) % 2 === 1;
              const isSelected = square === selectedSquare;
              const isLegalMove = legalMoves.has(square);

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative cursor-pointer ${
                    isDark ? "bg-accent" : "bg-background"
                  } ${isSelected ? "ring-2 ring-primary" : ""} 
                    ${isLegalMove ? "after:absolute after:inset-0 after:bg-primary/20" : ""}`}
                >
                  {piece && (
                    <Piece
                      piece={piece}
                      square={square}
                      onMove={onMove}
                    />
                  )}
                  {isLegalMove && !piece && (
                    <div className="absolute w-3 h-3 rounded-full bg-primary/40 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DndProvider>
  );
}