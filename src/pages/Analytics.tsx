import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw } from "lucide-react";

interface AnalyticsState {
  gameName: string;
  timeTaken: number;
  score: number;
  totalPossible: number;
}

const Analytics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as AnalyticsState;
  const [aiRemark, setAiRemark] = useState("");

  useEffect(() => {
    if (state) {
      generateAIRemark();
    }
  }, [state]);

  const generateAIRemark = () => {
    if (!state) return;

    const { gameName, timeTaken, score, totalPossible } = state;
    const percentage = (score / totalPossible) * 100;

    let remark = "";
    
    if (gameName === "Word Search") {
      if (percentage === 100) {
        remark = "Excellent work! Your visual scanning and pattern recognition skills are sharp. You found all words efficiently.";
      } else if (percentage >= 60) {
        remark = "Good effort! Your language processing is solid, but there's room for improvement in visual attention.";
      } else {
        remark = "Keep practicing! Word search games can help improve your visual scanning and attention to detail.";
      }
    } else if (gameName === "Memory Match") {
      if (score <= 15) {
        remark = "Outstanding memory! You completed the game with minimal moves, showing excellent short-term memory retention.";
      } else if (score <= 25) {
        remark = "Good memory skills! With practice, you can reduce the number of moves needed to match all pairs.";
      } else {
        remark = "Memory games like this help strengthen neural pathways. Regular practice can significantly improve recall.";
      }
    } else if (gameName === "Math Challenge") {
      if (percentage >= 90) {
        remark = "Exceptional mathematical reasoning! Your executive function and calculation abilities are excellent.";
      } else if (percentage >= 70) {
        remark = "Solid performance! Your arithmetic skills are good, with potential for even better accuracy with practice.";
      } else {
        remark = "Mathematical challenges strengthen cognitive flexibility. Regular practice improves both speed and accuracy.";
      }
    } else if (gameName === "Jigsaw Puzzle") {
      if (score <= 20) {
        remark = "Impressive spatial reasoning! You completed the puzzle efficiently with excellent planning skills.";
      } else if (score <= 40) {
        remark = "Good visuospatial abilities! Your approach shows logical thinking and decent problem-solving strategies.";
      } else {
        remark = "Puzzles enhance spatial cognition and planning. The more you practice, the more efficient your strategies become.";
      }
    } else if (gameName === "Clock Drawing") {
      remark = "Clock drawing tasks assess visuospatial skills, executive function, and memory. Your completion shows engagement with these cognitive domains.";
    }

    remark += ` Time taken: ${formatTime(timeTaken)}.`;
    setAiRemark(remark);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">No game data available</p>
          <Button onClick={() => navigate("/")} className="bg-gradient-primary text-primary-foreground">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const { gameName, timeTaken, score, totalPossible } = state;
  const percentage = Math.round((score / totalPossible) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Game Complete!
            </h1>
            <p className="text-xl text-muted-foreground">{gameName}</p>
          </div>

          <div className="bg-card rounded-lg shadow-card p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="text-lg font-semibold text-foreground">Time Taken</span>
                <span className="text-2xl font-bold text-primary">{formatTime(timeTaken)}</span>
              </div>

              {gameName !== "Clock Drawing" && (
                <>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <span className="text-lg font-semibold text-foreground">Score</span>
                    <span className="text-2xl font-bold text-primary">
                      {score} / {totalPossible}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <span className="text-lg font-semibold text-foreground">Accuracy</span>
                    <span className="text-2xl font-bold text-primary">{percentage}%</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-bold mb-3 text-foreground">AI Analysis</h2>
              <div className="bg-gradient-card rounded-lg p-6 border border-border">
                <p className="text-foreground leading-relaxed">{aiRemark}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              onClick={() => navigate(-2)}
              className="flex-1 gap-2 bg-gradient-primary text-primary-foreground shadow-button"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
