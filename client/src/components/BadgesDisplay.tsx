import React, { useState } from 'react';
import { User } from '@shared/schema';
import Badge from '@/components/Badge';
import { getUserBadges, BadgeCategory, BadgeLevel, Badge as BadgeType } from '@/lib/badgeSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Trophy, PalmtreeIcon, LockIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BadgesDisplayProps {
  user: User;
  title?: string;
  description?: string;
  compact?: boolean; // For compact display in profiles
  className?: string;
  showAllBadges?: boolean; // Show both earned and locked badges
}

const BadgesDisplay = ({
  user,
  title = "Achievement Badges",
  description = "Badges earned through marketplace activities",
  compact = false,
  className = "",
  showAllBadges = false
}: BadgesDisplayProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Get user's badges
  const userBadges = getUserBadges(user);
  
  // Filter badges by category and level
  const filteredBadges = userBadges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || badge.level === selectedLevel;
    return categoryMatch && levelMatch;
  });
  
  if (compact) {
    // Compact display for profile sections
    return (
      <div className={cn("space-y-3", className)}>
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        
        <div className="flex flex-wrap gap-2">
          {userBadges.length > 0 ? (
            userBadges.map(badge => (
              <Badge 
                key={badge.id} 
                badge={badge} 
                size="sm" 
              />
            ))
          ) : (
            <div className="w-full text-center py-2 text-sm text-muted-foreground">
              No badges earned yet
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(BadgeCategory).map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {Object.values(BadgeLevel).map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {userBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBadges.map(badge => (
              <div key={badge.id} className="flex flex-col items-center">
                <Badge 
                  badge={badge} 
                  size="md" 
                  showLabel={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <PalmtreeIcon className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No badges earned yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Participate in marketplace activities like creating, buying, or selling NFTs to earn achievement badges.
            </p>
          </div>
        )}
        
        {userBadges.length > 0 && userBadges.length < 5 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-3">
              <LockIcon className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">More badges to unlock</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Continue your journey in the VeCollab marketplace to earn more achievements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgesDisplay;