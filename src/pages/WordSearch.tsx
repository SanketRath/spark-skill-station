import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const THEMES = ["nature", "films", "sports", "food", "hobbies"];

const WordSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [setupComplete, setSetupComplete] = useState(false);
  const [theme, setTheme] = useState("");
  const [wordCount, setWordCount] = useState(5);
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [grid, setGrid] = useState<string[][]>([]);
  const [gridSize, setGridSize] = useState(10);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [wordPositions, setWordPositions] = useState<Map<string, string[]>>(new Map());

  const handleStartGame = async () => {
    if (!theme) {
      toast({ title: "Please select a theme", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-words', {
        body: { theme, count: wordCount }
      });
      
      if (error) throw error;
      
      setWords(data.words);
      setSetupComplete(true);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error generating words:', error);
      toast({ 
        title: "Error generating words", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (setupComplete && words.length > 0) {
      generateGrid();
    }
  }, [setupComplete, words]);

  const generateGrid = () => {
    const maxWordLength = Math.max(...words.map(w => w.length));
    const calculatedGridSize = Math.max(10, maxWordLength + 2);
    setGridSize(calculatedGridSize);

    const newGrid: string[][] = Array(calculatedGridSize).fill(null).map(() =>
      Array(calculatedGridSize).fill(null).map(() => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      )
    );

    const positions = new Map<string, string[]>();
    const directions = [
      { dx: 1, dy: 0, name: 'horizontal' },      // left to right
      { dx: -1, dy: 0, name: 'horizontal-rev' }, // right to left
      { dx: 0, dy: 1, name: 'vertical' },        // top to bottom
      { dx: 0, dy: -1, name: 'vertical-rev' }    // bottom to top
    ];

    words.forEach((word) => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const { dx, dy } = direction;
        
        let startRow, startCol;
        
        if (dx === 1) {
          startRow = Math.floor(Math.random() * calculatedGridSize);
          startCol = Math.floor(Math.random() * (calculatedGridSize - word.length + 1));
        } else if (dx === -1) {
          startRow = Math.floor(Math.random() * calculatedGridSize);
          startCol = word.length - 1 + Math.floor(Math.random() * (calculatedGridSize - word.length + 1));
        } else if (dy === 1) {
          startRow = Math.floor(Math.random() * (calculatedGridSize - word.length + 1));
          startCol = Math.floor(Math.random() * calculatedGridSize);
        } else {
          startRow = word.length - 1 + Math.floor(Math.random() * (calculatedGridSize - word.length + 1));
          startCol = Math.floor(Math.random() * calculatedGridSize);
        }
        
        let canPlace = true;
        const wordCells: string[] = [];
        
        for (let i = 0; i < word.length; i++) {
          const row = startRow + (dy * i);
          const col = startCol + (dx * i);
          
          if (row < 0 || row >= calculatedGridSize || col < 0 || col >= calculatedGridSize) {
            canPlace = false;
            break;
          }
          
          const currentChar = newGrid[row][col];
          if (currentChar !== word[i] && /[A-Z]/.test(currentChar) && 
              Array.from(positions.values()).some(cells => cells.includes(`${row}-${col}`))) {
            canPlace = false;
            break;
          }
          
          wordCells.push(`${row}-${col}`);
        }
        
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const row = startRow + (dy * i);
            const col = startCol + (dx * i);
            newGrid[row][col] = word[i];
          }
          positions.set(word, wordCells);
          placed = true;
        }
        
        attempts++;
      }
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
    
    words.forEach(word => {
      if (foundWords.includes(word)) return;
      
      const positions = wordPositions.get(word);
      if (!positions) return;
      
      const allFound = positions.every(pos => selectedArray.includes(pos));
      
      if (allFound) {
        setFoundWords([...foundWords, word]);
        setFoundCells(prev => new Set([...prev, ...positions]));
        setSelectedCells(new Set());
        
        if (foundWords.length + 1 === words.length) {
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
        totalPossible: words.length
      } 
    });
  };

  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Word Search</h1>
            <p className="text-muted-foreground">Configure your game</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Select Theme</label>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <Button
                    key={t}
                    onClick={() => setTheme(t)}
                    variant={theme === t ? "default" : "outline"}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Number of Words: {wordCount}</label>
              <input
                type="range"
                min="3"
                max="8"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleStartGame}
              disabled={!theme || loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Start Game"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {words.map(word => (
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
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
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
