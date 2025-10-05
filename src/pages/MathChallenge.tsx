import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Problem {
  question: string;
  answer: number;
}

const DIFFICULTY_CONFIG = {
  easy: { range: 10, operations: ["+", "-"], problems: 10, label: "Easy" },
  medium: { range: 20, operations: ["+", "-", "×"], problems: 15, label: "Medium" },
  hard: { range: 50, operations: ["+", "-", "×"], problems: 20, label: "Difficult" }
};

const MathChallenge = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [startTime, setStartTime] = useState(Date.now());
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [totalProblems, setTotalProblems] = useState(10);

  const handleStartGame = () => {
    setSetupComplete(true);
    setStartTime(Date.now());
    const config = DIFFICULTY_CONFIG[difficulty];
    setTotalProblems(config.problems);
  };

  useEffect(() => {
    if (setupComplete) {
      generateProblem();
    }
  }, [setupComplete]);

  useEffect(() => {
    if (setupComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentProblem, setupComplete]);

  const generateProblem = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const num1 = Math.floor(Math.random() * config.range) + 1;
    const num2 = Math.floor(Math.random() * config.range) + 1;
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)];

    let answer: number;
    let question: string;

    switch (operation) {
      case "+":
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case "-":
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case "×":
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = 0;
        question = "";
    }

    setCurrentProblem({ question, answer });
    setUserAnswer("");
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!currentProblem || userAnswer === "") return;

    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setAttempts(attempts + 1);

    if (attempts + 1 >= totalProblems) {
      setTimeout(() => handleComplete(), 1000);
    } else {
      setTimeout(() => generateProblem(), 1000);
    }
  };

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    navigate("/analytics", {
      state: {
        gameName: "Math Challenge",
        timeTaken,
        score,
        totalPossible: totalProblems,
      },
    });
  };

  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Math Challenge</h1>
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

  return (
    <GameLayout
      title="Math Challenge"
      onGiveUp={() => navigate("/")}
      onNext={handleComplete}
      startTime={startTime}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-card space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Problem {attempts + 1} of {totalProblems}</span>
            <span>Score: {score}/{attempts}</span>
          </div>

          {currentProblem && (
            <div className="space-y-4">
              <div className="text-5xl font-bold text-center py-8 text-foreground">
                {currentProblem.question} = ?
              </div>

              <Input
                ref={inputRef}
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Your answer"
                className="text-2xl text-center h-16"
                disabled={feedback !== null}
                autoFocus
              />

              <Button
                onClick={handleSubmit}
                disabled={!userAnswer || feedback !== null}
                className="w-full h-12 text-lg bg-gradient-primary text-primary-foreground shadow-button"
              >
                Submit Answer
              </Button>

              {feedback && (
                <div
                  className={`
                    text-center p-4 rounded-lg font-semibold animate-scale-in
                    ${feedback === "correct"
                      ? "bg-success text-success-foreground"
                      : "bg-destructive text-destructive-foreground"
                    }
                  `}
                >
                  {feedback === "correct" ? "✓ Correct!" : "✗ Incorrect"}
                  {feedback === "incorrect" && ` The answer was ${currentProblem.answer}`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default MathChallenge;
