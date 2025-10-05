import { Brain, Search, Grid3x3, Calculator, PuzzleIcon, Clock } from "lucide-react";
import { GameCard } from "@/components/GameCard";

const Home = () => {
  const games = [
    {
      title: "Word Search",
      description: "Test your language skills and visual scanning by finding hidden words in the grid",
      icon: Search,
      route: "/word-search",
    },
    {
      title: "Memory Match",
      description: "Challenge your short-term memory by matching pairs of cards",
      icon: Grid3x3,
      route: "/memory-match",
    },
    {
      title: "Math Challenge",
      description: "Test your executive function and reasoning with arithmetic problems",
      icon: Calculator,
      route: "/math-challenge",
    },
    {
      title: "Jigsaw Puzzle",
      description: "Enhance your visuospatial skills by assembling puzzle pieces",
      icon: PuzzleIcon,
      route: "/jigsaw-puzzle",
    },
    {
      title: "Clock Drawing",
      description: "Test visuospatial skills and memory by drawing clock faces",
      icon: Clock,
      route: "/clock-drawing",
    },
    {
      title: "Coming Soon",
      description: "More exciting cognitive challenges are on the way!",
      icon: Brain,
      route: "#",
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Brain Training Games
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Challenge your cognitive abilities with scientifically designed games
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {games.map((game, index) => (
            <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <GameCard {...game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
