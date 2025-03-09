import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function VerifiedBadge({ 
  className = "", 
  size = "md",
  showTooltip = true 
}: VerifiedBadgeProps) {
  // Determine size-based styling
  const sizeStyles = {
    sm: {
      badge: "px-1.5 py-0.5 text-[0.65rem]",
      icon: "h-2 w-2 mr-0.5",
    },
    md: {
      badge: "px-2 py-0.5 text-xs",
      icon: "h-3 w-3 mr-1",
    },
    lg: {
      badge: "px-2.5 py-1 text-sm",
      icon: "h-4 w-4 mr-1",
    },
  }[size];
  
  const badge = (
    <Badge 
      className={`bg-blue-500 hover:bg-blue-600 text-white ${sizeStyles.badge} ${className}`}
    >
      <CheckCircle2 className={sizeStyles.icon} />
      Verified
    </Badge>
  );
  
  if (!showTooltip) {
    return badge;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">This creator has been verified by VeCollab</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}