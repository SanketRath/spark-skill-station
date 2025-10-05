import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Problem {
  question: string;
  answer: number;
}

const MathChallenge = () => {
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const totalProblems = 10;

  useEffect(() => {
    generateProblem();
  }, []);

  const generateProblem = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ["+", "-", "×"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

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
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Your answer"
                className="text-2xl text-center h-16"
                disabled={feedback !== null}
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
