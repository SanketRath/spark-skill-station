import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_SETS = {
  easy: ["🧠", "🎯", "⭐", "🎨", "🔥", "💡", "🎭", "🌟"],
  medium: ["🧠", "🎯", "⭐", "🎨", "🔥", "💡", "🎭", "🌟", "🚀", "🌈", "🎪", "🎸", "🎮", "🎲", "🎺", "🎻", "🏆", "🌺"],
  hard: ["🧠", "🎯", "⭐", "🎨", "🔥", "💡", "🎭", "🌟", "🚀", "🌈", "🎪", "🎸", "🎮", "🎲", "🎺", "🎻", "🏆", "🌺", "🎪", "🎨", "🎭", "🌟", "🔥", "💡", "🚀", "🌈", "🎸", "🎮", "🎲", "🎺", "🏆", "🌺"]
};

const DIFFICULTY_CONFIG = {
  easy: { gridCols: 4, pairs: 8, label: "Easy (4x4)" },
  medium: { gridCols: 6, pairs: 18, label: "Medium (6x6)" },
  hard: { gridCols: 8, pairs: 32, label: "Difficult (8x8)" }
};

const MemoryMatch = () => {
  const navigate = useNavigate();
  const [setupComplete, setSetupComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [startTime, setStartTime] = useState(Date.now());
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gridCols, setGridCols] = useState(4);

  const handleStartGame = () => {
    setSetupComplete(true);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (setupComplete) {
      initializeCards();
    }
  }, [setupComplete]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      if (cards[first].value === cards[second].value) {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, isMatched: true } : card
          ));
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedIndices([]);
        }, 1000);
      }
      setMoves(m => m + 1);
    }
  }, [flippedIndices, cards]);

  const initializeCards = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const emojis = EMOJI_SETS[difficulty].slice(0, config.pairs);
    const doubled = [...emojis, ...emojis];
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({
        id,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setGridCols(config.gridCols);
  };

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    setCards(prev => prev.map((card, idx) =>
      idx === index ? { ...card, isFlipped: true } : card
    ));
    setFlippedIndices(prev => [...prev, index]);
  };

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const config = DIFFICULTY_CONFIG[difficulty];
    navigate("/analytics", {
      state: {
        gameName: "Memory Match",
        timeTaken,
        score: moves,
        totalPossible: config.pairs,
      },
    });
  };

  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Memory Match</h1>
            <p className="text-muted-foreground">Select difficulty level</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card space-y-4">
            {(Object.keys(DIFFICULTY_CONFIG) as Array<keyof typeof DIFFICULTY_CONFIG>).map((diff) => (
              <Button
                key={diff}
                onClick={() => setDifficulty(diff)}
                variant={difficulty === diff ? "default" : "outline"}
                className="w-full"
              >
                {DIFFICULTY_CONFIG[diff].label}
              </Button>
            ))}

            <Button onClick={handleStartGame} className="w-full mt-6">
              Start Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allMatched = cards.length > 0 && cards.every(card => card.isMatched);

  useEffect(() => {
    if (allMatched) {
      setTimeout(() => handleComplete(), 500);
    }
  }, [allMatched]);

  return (
    <GameLayout
      title="Memory Match"
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

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || card.isFlipped}
              className={`
                aspect-square rounded-lg text-5xl font-bold transition-all duration-300
                ${card.isFlipped || card.isMatched
                  ? 'bg-gradient-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted-foreground/10'
                }
                ${card.isMatched ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                shadow-card hover:shadow-card-hover hover:scale-105
              `}
            >
              {card.isFlipped || card.isMatched ? card.value : "?"}
            </button>
          ))}
        </div>

        {allMatched && (
          <div className="bg-success text-success-foreground rounded-lg p-4 text-center font-semibold animate-scale-in">
            🎉 Congratulations! You matched all cards!
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default MemoryMatch;
