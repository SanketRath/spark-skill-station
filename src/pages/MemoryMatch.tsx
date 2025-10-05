import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_VALUES = ["🧠", "🎯", "⭐", "🎨", "🔥", "💡", "🎭", "🌟"];

const MemoryMatch = () => {
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initializeCards();
  }, []);

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
    const doubled = [...CARD_VALUES, ...CARD_VALUES];
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({
        id,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
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
    navigate("/analytics", {
      state: {
        gameName: "Memory Match",
        timeTaken,
        score: moves,
        totalPossible: CARD_VALUES.length,
      },
    });
  };

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

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || card.isFlipped}
              className={`
                aspect-square rounded-lg text-4xl font-bold transition-all duration-300
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
