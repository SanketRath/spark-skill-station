import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";

const ClockDrawing = () => {
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 500;

    // Draw initial circle guide (faint)
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 250, 200, 0, 2 * Math.PI);
    ctx.stroke();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the guide circle
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 250, 200, 0, 2 * Math.PI);
    ctx.stroke();
    
    setHasDrawn(false);
  };

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    navigate("/analytics", {
      state: {
        gameName: "Clock Drawing",
        timeTaken,
        score: hasDrawn ? 1 : 0,
        totalPossible: 1,
      },
    });
  };

  return (
    <GameLayout
      title="Clock Drawing"
      onGiveUp={() => navigate("/")}
      onNext={handleComplete}
      startTime={startTime}
    >
      <div className="w-full max-w-3xl space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-center text-foreground">
            Draw a clock showing 10:10
          </h2>
          
          <div className="bg-background rounded-lg p-4 border-2 border-border">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="cursor-crosshair mx-auto border border-border rounded-lg bg-white"
            />
          </div>

          <div className="mt-4 flex justify-center gap-3">
            <Button
              onClick={clearCanvas}
              variant="outline"
              className="border-muted-foreground text-muted-foreground hover:bg-muted"
            >
              Clear Canvas
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!hasDrawn}
              className="bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90 disabled:opacity-50"
            >
              Submit Drawing
            </Button>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-semibold">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Draw a circle for the clock face</li>
            <li>Add all 12 numbers in their correct positions</li>
            <li>Draw two hands showing 10:10 (hour hand pointing to 10, minute hand to 2)</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
};

export default ClockDrawing;
