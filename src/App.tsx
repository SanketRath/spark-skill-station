import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WordSearch from "./pages/WordSearch";
import MemoryMatch from "./pages/MemoryMatch";
import MathChallenge from "./pages/MathChallenge";
import JigsawPuzzle from "./pages/JigsawPuzzle";
import ClockDrawing from "./pages/ClockDrawing";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/memory-match" element={<MemoryMatch />} />
          <Route path="/math-challenge" element={<MathChallenge />} />
          <Route path="/jigsaw-puzzle" element={<JigsawPuzzle />} />
          <Route path="/clock-drawing" element={<ClockDrawing />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
