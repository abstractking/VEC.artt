import React from 'react';
import { Badge as BadgeType } from '@/lib/badgeSystem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Palette, PaintBucket, Brush, FolderKanban, ShoppingBag, GalleryHorizontal, 
  Trophy, Tags, Banknote, TrendingUp, DollarSign, Share2, BadgeCheck, 
  Rocket, Heart, Fish,
  Icon as LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map badge icons to Lucide components
const iconMap: Record<string, React.ElementType> = {
  Palette,
  PaintBucket,
  Brush,
  FolderKanban,
  ShoppingBag,
  GalleryHorizontal,
  Trophy,
  Tags,
  Banknote,
  TrendingUp,
  DollarSign,
  Share2,
  BadgeCheck,
  Rocket,
  Heart,
  Whale,
};

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  showLabel?: boolean;
}

const Badge = ({ 
  badge, 
  size = 'md', 
  showTooltip = true, 
  className = '',
  showLabel = false
}: BadgeProps) => {
  const IconComponent = iconMap[badge.icon] || Trophy;
  
  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  };
  
  const badgeComponent = (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        className={cn(
          "rounded-full flex items-center justify-center", 
          sizeClasses[size],
          "bg-opacity-10 border-2"
        )}
        style={{ 
          backgroundColor: `${badge.color}20`, 
          borderColor: badge.color 
        }}
      >
        <IconComponent 
          size={iconSizes[size]} 
          className="text-foreground"
          style={{ color: badge.color }}
        />
      </div>
      {showLabel && (
        <span className={cn("mt-1 font-medium text-center", textSizes[size])}>
          {badge.name}
        </span>
      )}
    </div>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeComponent}
          </TooltipTrigger>
          <TooltipContent className="p-2 max-w-xs">
            <div className="space-y-1">
              <h4 className="font-semibold">{badge.name}</h4>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              <div className="flex items-center gap-1 mt-1">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: badge.color }}
                />
                <span className="text-xs capitalize">{badge.level} • {badge.category}</span>
              </div>
              {badge.unlockedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return badgeComponent;
};

export default Badge;