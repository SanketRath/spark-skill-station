import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameLayoutProps {
  title: string;
  children: ReactNode;
  onGiveUp: () => void;
  onNext: () => void;
  hideControls?: boolean;
  startTime?: number;
}

export const GameLayout = ({ 
  title, 
  children, 
  onGiveUp, 
  onNext,
  hideControls = false,
  startTime = Date.now()
}: GameLayoutProps) => {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="hover:bg-muted gap-2"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Button>

        <h1 className="text-2xl font-bold text-foreground">{title}</h1>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-mono text-lg font-semibold text-foreground">
            {formatTime(elapsedTime)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>

      {/* Bottom Controls */}
      {!hideControls && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onGiveUp();
                onNext();
              }}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Give Up
            </Button>
            <Button
              onClick={onNext}
              className="bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
