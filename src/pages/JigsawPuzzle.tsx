import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  correctPosition: number;
}

const GRID_SIZE = 3; // 3x3 puzzle

const JigsawPuzzle = () => {
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initializePuzzle();
  }, []);

  const initializePuzzle = () => {
    const totalPieces = GRID_SIZE * GRID_SIZE;
    const initialPieces: PuzzlePiece[] = Array.from({ length: totalPieces }, (_, i) => ({
      id: i,
      currentPosition: i,
      correctPosition: i,
    }));

    // Shuffle pieces
    const shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
    shuffled.forEach((piece, index) => {
      piece.currentPosition = index;
    });

    setPieces(shuffled);
  };

  const handlePieceClick = (position: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(position);
    } else {
      // Swap pieces
      setPieces(prev => {
        const newPieces = [...prev];
        const piece1Index = newPieces.findIndex(p => p.currentPosition === selectedPiece);
        const piece2Index = newPieces.findIndex(p => p.currentPosition === position);
        
        newPieces[piece1Index].currentPosition = position;
        newPieces[piece2Index].currentPosition = selectedPiece;
        
        return newPieces;
      });
      setSelectedPiece(null);
      setMoves(m => m + 1);
    }
  };

  const isPuzzleSolved = pieces.every(piece => piece.currentPosition === piece.correctPosition);

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    navigate("/analytics", {
      state: {
        gameName: "Jigsaw Puzzle",
        timeTaken,
        score: moves,
        totalPossible: GRID_SIZE * GRID_SIZE,
      },
    });
  };

  const getPieceAtPosition = (position: number) => {
    return pieces.find(p => p.currentPosition === position);
  };

  return (
    <GameLayout
      title="Jigsaw Puzzle"
      onGiveUp={() => navigate("/")}
      onNext={handleComplete}
      startTime={startTime}
    >
      <div className="w-full max-w-2xl space-y-6">
        <div className="bg-card rounded-lg p-4 shadow-card">
          <p className="text-center text-lg font-semibold text-foreground">
            Moves: <span className="text-primary">{moves}</span>
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-card">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, position) => {
              const piece = getPieceAtPosition(position);
              const isSelected = selectedPiece === position;
              const isCorrect = piece?.currentPosition === piece?.correctPosition;

              return (
                <button
                  key={position}
                  onClick={() => handlePieceClick(position)}
                  className={`
                    aspect-square rounded-lg transition-all duration-300 relative
                    flex items-center justify-center text-4xl font-bold
                    ${isSelected 
                      ? 'bg-gradient-accent text-accent-foreground scale-105 shadow-card-hover' 
                      : isCorrect
                      ? 'bg-success text-success-foreground'
                      : 'bg-gradient-primary text-primary-foreground hover:scale-105'
                    }
                    shadow-card cursor-pointer
                  `}
                >
                  {piece && (
                    <div className="flex flex-col items-center">
                      <span>{piece.id + 1}</span>
                      {isCorrect && <span className="text-sm">✓</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isPuzzleSolved && (
          <div className="bg-success text-success-foreground rounded-lg p-4 text-center font-semibold animate-scale-in">
            🎉 Puzzle completed!
          </div>
        )}

        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground text-center">
          Click two pieces to swap their positions. Arrange them in order from 1 to {GRID_SIZE * GRID_SIZE}.
        </div>
      </div>
    </GameLayout>
  );
};

export default JigsawPuzzle;
