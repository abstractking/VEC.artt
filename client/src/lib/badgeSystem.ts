// Badge System for VeCollab Marketplace
import { User, NFT, Transaction } from "@shared/schema";

// Badge type interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  level: BadgeLevel;
  criteria: (user: User) => boolean;
  color: string;  // CSS color for the badge
  unlockedAt?: Date;
}

// Badge category enum
export enum BadgeCategory {
  CREATOR = 'creator',
  COLLECTOR = 'collector',
  TRADER = 'trader',
  COMMUNITY = 'community',
  ACHIEVEMENT = 'achievement'
}

// Badge level enum
export enum BadgeLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

// UserBadge interface (what gets stored in user.badges)
export interface UserBadge {
  id: string;
  unlockedAt: Date;
}

// Define all badges with their criteria
export const BADGES: Badge[] = [
  // Creator badges
  {
    id: 'first_creation',
    name: 'First Creation',
    description: 'Minted your first NFT',
    icon: 'Palette',
    category: BadgeCategory.CREATOR,
    level: BadgeLevel.BRONZE,
    criteria: (user: User) => (user.stats?.createdNFTs || 0) >= 1,
    color: '#CD7F32' // Bronze color
  },
  {
    id: 'prolific_creator',
    name: 'Prolific Creator',
    description: 'Minted at least 10 NFTs',
    icon: 'PaintBucket',
    category: BadgeCategory.CREATOR,
    level: BadgeLevel.SILVER,
    criteria: (user: User) => (user.stats?.createdNFTs || 0) >= 10,
    color: '#C0C0C0' // Silver color
  },
  {
    id: 'master_creator',
    name: 'Master Creator',
    description: 'Minted at least 50 NFTs',
    icon: 'Brush',
    category: BadgeCategory.CREATOR,
    level: BadgeLevel.GOLD,
    criteria: (user: User) => (user.stats?.createdNFTs || 0) >= 50,
    color: '#FFD700' // Gold color
  },
  {
    id: 'collection_curator',
    name: 'Collection Curator',
    description: 'Created at least 3 collections',
    icon: 'FolderKanban',
    category: BadgeCategory.CREATOR,
    level: BadgeLevel.SILVER,
    criteria: (user: User) => (user.stats?.collections || 0) >= 3,
    color: '#C0C0C0' // Silver color
  },
  
  // Collector badges
  {
    id: 'first_purchase',
    name: 'First Purchase',
    description: 'Purchased your first NFT',
    icon: 'ShoppingBag',
    category: BadgeCategory.COLLECTOR,
    level: BadgeLevel.BRONZE,
    criteria: (user: User) => (user.stats?.totalNFTs || 0) >= 1,
    color: '#CD7F32' // Bronze color
  },
  {
    id: 'avid_collector',
    name: 'Avid Collector',
    description: 'Own at least 10 NFTs',
    icon: 'GalleryHorizontal',
    category: BadgeCategory.COLLECTOR,
    level: BadgeLevel.SILVER,
    criteria: (user: User) => (user.stats?.ownedNFTs || 0) >= 10,
    color: '#C0C0C0' // Silver color
  },
  {
    id: 'elite_collector',
    name: 'Elite Collector',
    description: 'Own at least 50 NFTs',
    icon: 'Trophy',
    category: BadgeCategory.COLLECTOR,
    level: BadgeLevel.GOLD,
    criteria: (user: User) => (user.stats?.ownedNFTs || 0) >= 50,
    color: '#FFD700' // Gold color
  },
  
  // Trader badges
  {
    id: 'first_sale',
    name: 'First Sale',
    description: 'Sold your first NFT',
    icon: 'Tags',
    category: BadgeCategory.TRADER,
    level: BadgeLevel.BRONZE,
    criteria: (user: User) => (user.stats?.totalSales || 0) >= 1,
    color: '#CD7F32' // Bronze color
  },
  {
    id: 'active_trader',
    name: 'Active Trader',
    description: 'Completed at least 10 sales',
    icon: 'Banknote',
    category: BadgeCategory.TRADER,
    level: BadgeLevel.SILVER,
    criteria: (user: User) => (user.stats?.totalSales || 0) >= 10,
    color: '#C0C0C0' // Silver color
  },
  {
    id: 'power_trader',
    name: 'Power Trader',
    description: 'Completed at least 50 sales',
    icon: 'TrendingUp',
    category: BadgeCategory.TRADER,
    level: BadgeLevel.GOLD,
    criteria: (user: User) => (user.stats?.totalSales || 0) >= 50,
    color: '#FFD700' // Gold color
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Total trading volume over 10,000 VET',
    icon: 'DollarSign',
    category: BadgeCategory.TRADER,
    level: BadgeLevel.PLATINUM,
    criteria: (user: User) => parseFloat(user.stats?.totalRevenue || '0') >= 10000,
    color: '#E5E4E2' // Platinum color
  },
  
  // Community badges
  {
    id: 'socially_connected',
    name: 'Socially Connected',
    description: 'Connected at least 2 social accounts',
    icon: 'Share2',
    category: BadgeCategory.COMMUNITY,
    level: BadgeLevel.SILVER,
    criteria: (user: User) => user.socialLinks ? Object.keys(user.socialLinks).length >= 2 : false,
    color: '#C0C0C0' // Silver color
  },
  {
    id: 'verified_artist',
    name: 'Verified Artist',
    description: 'Account has been verified',
    icon: 'BadgeCheck',
    category: BadgeCategory.COMMUNITY,
    level: BadgeLevel.GOLD,
    criteria: (user: User) => user.isVerified === true,
    color: '#FFD700' // Gold color
  },
  
  // Achievement badges
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined during the platform launch phase',
    icon: 'Rocket',
    category: BadgeCategory.ACHIEVEMENT,
    level: BadgeLevel.GOLD,
    criteria: (user: User) => {
      const userCreationDate = new Date(user.createdAt);
      const launchEndDate = new Date('2025-06-30'); // Example launch phase end date
      return userCreationDate <= launchEndDate;
    },
    color: '#FFD700' // Gold color
  },
  {
    id: 'art_enthusiast',
    name: 'Art Enthusiast',
    description: 'Added at least 10 NFTs to your favorites',
    icon: 'Heart',
    category: BadgeCategory.ACHIEVEMENT,
    level: BadgeLevel.SILVER,
    criteria: (user: User) => (user.favorites?.length || 0) >= 10,
    color: '#C0C0C0' // Silver color
  },
  {
    id: 'whale',
    name: 'Whale',
    description: 'Completed a single purchase of over 5,000 VET',
    icon: 'Fish',
    category: BadgeCategory.ACHIEVEMENT,
    level: BadgeLevel.DIAMOND,
    criteria: (user: User) => true, // Special badge given manually or through transaction analysis
    color: '#B9F2FF' // Diamond-like color
  }
];

// Helper functions for badge system
export function getUserBadges(user: User): Badge[] {
  const userBadgeIds = (user.badges as UserBadge[] || []).map(b => b.id);
  return BADGES.filter(badge => userBadgeIds.includes(badge.id));
}

export function getUnlockedBadges(user: User): Badge[] {
  return BADGES.filter(badge => badge.criteria(user));
}

export function getNewlyUnlockedBadges(user: User): Badge[] {
  const currentUserBadgeIds = (user.badges as UserBadge[] || []).map(b => b.id);
  return BADGES.filter(badge => 
    !currentUserBadgeIds.includes(badge.id) && badge.criteria(user)
  );
}

export function updateUserBadges(user: User): { user: User, newBadges: Badge[] } {
  const newBadges = getNewlyUnlockedBadges(user);
  
  if (newBadges.length > 0) {
    const newUserBadges: UserBadge[] = newBadges.map(badge => ({
      id: badge.id,
      unlockedAt: new Date()
    }));
    
    const updatedUser = {
      ...user,
      badges: [...(user.badges as UserBadge[] || []), ...newUserBadges]
    };
    
    return { user: updatedUser, newBadges };
  }
  
  return { user, newBadges: [] };
}

export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGES.find(badge => badge.id === badgeId);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter(badge => badge.category === category);
}

export function getBadgesByLevel(level: BadgeLevel): Badge[] {
  return BADGES.filter(badge => badge.level === level);
}