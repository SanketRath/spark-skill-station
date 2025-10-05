import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";

const GRID_SIZE = 10;
const WORDS = ["BRAIN", "FOCUS", "MEMORY", "THINK", "LEARN"];

const WordSearch = () => {
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [wordPositions, setWordPositions] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      )
    );

    const positions = new Map<string, string[]>();

    // Place words horizontally
    WORDS.forEach((word, idx) => {
      const row = idx * 2;
      const startCol = Math.floor(Math.random() * (GRID_SIZE - word.length));
      const wordCells: string[] = [];
      for (let i = 0; i < word.length; i++) {
        newGrid[row][startCol + i] = word[i];
        wordCells.push(`${row}-${startCol + i}`);
      }
      positions.set(word, wordCells);
    });

    setGrid(newGrid);
    setWordPositions(positions);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    const cellKey = `${row}-${col}`;
    setSelectedCells(new Set([cellKey]));
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return;
    const cellKey = `${row}-${col}`;
    setSelectedCells(prev => new Set([...prev, cellKey]));
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    checkForWord(selectedCells);
  };

  const checkForWord = (selected: Set<string>) => {
    const selectedArray = Array.from(selected);
    
    WORDS.forEach(word => {
      if (foundWords.includes(word)) return;
      
      const positions = wordPositions.get(word);
      if (!positions) return;
      
      const allFound = positions.every(pos => selectedArray.includes(pos));
      
      if (allFound) {
        setFoundWords([...foundWords, word]);
        setFoundCells(prev => new Set([...prev, ...positions]));
        setSelectedCells(new Set());
        
        if (foundWords.length + 1 === WORDS.length) {
          setTimeout(() => handleComplete(), 500);
        }
      }
    });
    
    if (!foundWords.some(word => {
      const positions = wordPositions.get(word);
      return positions?.every(pos => selectedArray.includes(pos));
    })) {
      setTimeout(() => setSelectedCells(new Set()), 300);
    }
  };

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    navigate("/analytics", { 
      state: { 
        gameName: "Word Search",
        timeTaken,
        score: foundWords.length,
        totalPossible: WORDS.length
      } 
    });
  };

  return (
    <GameLayout
      title="Word Search"
      onGiveUp={() => navigate("/")}
      onNext={handleComplete}
      startTime={startTime}
    >
      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Find these words:</h2>
          <div className="flex flex-wrap gap-3">
            {WORDS.map(word => (
              <span
                key={word}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  foundWords.includes(word)
                    ? 'bg-success text-success-foreground line-through'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-card">
          <div 
            className="inline-grid gap-1 select-none" 
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsSelecting(false)}
          >
            {grid.map((row, rowIdx) =>
              row.map((letter, colIdx) => {
                const cellKey = `${rowIdx}-${colIdx}`;
                const isSelected = selectedCells.has(cellKey);
                const isFound = foundCells.has(cellKey);
                return (
                  <button
                    key={cellKey}
                    onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                    onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                    className={`
                      w-10 h-10 rounded font-bold text-sm transition-all cursor-pointer
                      ${isFound
                        ? 'bg-success text-success-foreground'
                        : isSelected 
                        ? 'bg-gradient-primary text-primary-foreground scale-110' 
                        : 'bg-muted hover:bg-muted-foreground/10 text-foreground'
                      }
                    `}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default WordSearch;
