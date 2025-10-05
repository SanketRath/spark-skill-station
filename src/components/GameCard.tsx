import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  comingSoon?: boolean;
}

export const GameCard = ({ title, description, icon: Icon, route, comingSoon }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => !comingSoon && navigate(route)}
      className={`
        relative overflow-hidden bg-gradient-card border-border shadow-card
        transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]
        h-full flex flex-col
        ${comingSoon ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `}
    >
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-lg bg-gradient-primary">
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
          {comingSoon && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">
              Coming Soon
            </span>
          )}
        </div>
        
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary" />
    </Card>
  );
};
