import { useDrag, useDrop } from "react-dnd";

interface PieceProps {
  piece: string;
  square: string;
  onMove: (from: string, to: string) => void;
}

export default function Piece({ piece, square, onMove }: PieceProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "piece",
    item: { from: square },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "piece",
    drop: (item: { from: string }) => {
      onMove(item.from, square);
    },
  });

  const getPieceImage = (piece: string) => {
    const color = piece.charAt(0);
    const type = piece.charAt(1);
    return `https://www.chess.com/chess-themes/pieces/neo/150/${color}${type}.png`;
  };

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`absolute inset-0 cursor-grab ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <img
        src={getPieceImage(piece)}
        alt={piece}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}