# VeCollab Reusable Components Guide

A comprehensive guide to all reusable components from the VeCollab NFT marketplace that can be imported into your Sovereign Network marketplace or any other project.

---

## Table of Contents

1. [Core Marketplace Components](#core-marketplace-components)
2. [Single NFT / Detail Components](#single-nft--detail-components)
3. [Transaction Flow Components](#transaction-flow-components)
4. [User & Wallet Components](#user--wallet-components)
5. [Layout Components](#layout-components)
6. [Common UI Atoms](#common-ui-atoms)
7. [Implementation Notes](#implementation-notes)

---

## Core Marketplace Components

### 1. NFTCard

**Location:** `client/src/components/NFTCard.tsx`

**Purpose:** Display individual NFT as a card with image, name, price, auction timer, and favorite toggle.

**Key Features:**
- NFT image with hover scale effect
- Live auction countdown timer
- Favorite/like button with auth check
- Creator info from API
- Responsive design with smooth animations
- Link to NFT detail page

**Props Interface:**
```typescript
interface NFTCardProps {
  nft: NFT;
}
```

**NFT Interface (from schema):**
```typescript
interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  price: string | number;
  currency: string;
  creatorId: string;
  ownerId: string;
  isForSale: boolean;
  isBiddable: boolean;
  metadata?: {
    auctionEndDate?: string;
    category?: string;
    // ... other metadata
  };
}
```

**Key Implementation Details:**
- Uses `useQuery` from `@tanstack/react-query` for creator data fetching
- Implements favorite toggle with user authentication
- Dynamic time remaining calculation for auctions
- Smooth image loading with error handling
- Uses Tailwind CSS for styling with custom hover effects

**Usage Example:**
```tsx
import NFTCard from './NFTCard';
import { NFT } from '@shared/schema';

export function MyNFTGrid({ nfts }: { nfts: NFT[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
}
```

---

### 2. SearchBar

**Location:** `client/src/components/SearchBar.tsx`

**Purpose:** Provide a search input with icon and navigation to search results.

**Key Features:**
- Customizable placeholder text
- Custom CSS class support
- Search form submission
- URL-encoded search navigation
- Search icon in input

**Props Interface:**
```typescript
interface SearchBarProps {
  placeholder?: string;
  className?: string;
}
```

**Usage Example:**
```tsx
import SearchBar from './SearchBar';

export function Header() {
  return (
    <nav>
      <SearchBar 
        placeholder="Search items, collections, and accounts"
        className="w-full max-w-2xl"
      />
    </nav>
  );
}
```

---

### 3. TrendingNFTs

**Location:** `client/src/components/TrendingNFTs.tsx`

**Purpose:** Display a grid of trending NFTs with category filtering.

**Key Features:**
- Responsive grid layout (1-4 columns)
- Category filtering (All, Art, Collectibles, Photography)
- Mobile-friendly dropdown for categories
- Loading skeleton states
- Empty state with call-to-action
- Displays up to 4 NFTs with "View More" link

**Props Interface:**
```typescript
interface TrendingNFTsProps {
  nfts: NFT[];
  isLoading: boolean;
}
```

**Usage Example:**
```tsx
import TrendingNFTs from './TrendingNFTs';
import { useQuery } from '@tanstack/react-query';

export function HomePage() {
  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ['/api/nfts/trending'],
  });

  return <TrendingNFTs nfts={nfts} isLoading={isLoading} />;
}
```

---

### 4. CollectionCard

**Location:** `client/src/components/CollectionCard.tsx`

**Purpose:** Display collection information as a card component.

**Key Features:**
- Collection cover image
- Creator avatar (overlaid on image)
- Collection name and info
- Stats display
- Hover effects
- Link to collection detail page

**Props Interface:**
```typescript
interface CollectionCardProps {
  collection: Collection;
}

interface Collection {
  id: string;
  name: string;
  coverImage: string;
  creatorId: string;
  // ... other fields
}
```

**Usage Example:**
```tsx
import CollectionCard from './CollectionCard';

export function CollectionsGrid({ collections }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
```

---

### 5. CreatorCard

**Location:** `client/src/components/CreatorCard.tsx`

**Purpose:** Showcase creator profile with stats and NFT preview.

**Key Features:**
- Creator avatar with verified badge
- Creator username and handle
- Trading volume display
- Preview of 3 recent NFTs
- Link to creator profile
- Responsive design

**Props Interface:**
```typescript
interface CreatorCardProps {
  creator: User;
}

interface User {
  id: string;
  username: string;
  profileImage?: string;
  // ... other fields
}
```

**Usage Example:**
```tsx
import CreatorCard from './CreatorCard';

export function CreatorShowcase({ creators }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  );
}
```

---

### 6. RandomArtGallery

**Location:** `client/src/components/RandomArtGallery.tsx`

**Purpose:** Display a gallery of random art NFTs with refresh functionality.

**Key Features:**
- Auto-refresh of NFTs
- Manual refresh button
- Loading states with skeletons
- Responsive grid
- Responsive image handling

**Props Interface:**
```typescript
interface RandomArtGalleryProps {
  nfts?: NFT[];
  isLoading?: boolean;
}
```

**Usage Example:**
```tsx
import RandomArtGallery from './RandomArtGallery';

export function ArtGallery() {
  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ['/api/nfts/random'],
  });

  return <RandomArtGallery nfts={nfts} isLoading={isLoading} />;
}
```

---

### 7. TopCollections

**Location:** `client/src/components/TopCollections.tsx`

**Purpose:** Display the top performing collections.

**Key Features:**
- Collection list/grid view
- Loading states
- Responsive layout
- Performance metrics

**Props Interface:**
```typescript
interface TopCollectionsProps {
  collections: Collection[];
  isLoading: boolean;
}
```

---

## Single NFT / Detail Components

### 1. BuyNFTDialog

**Location:** `client/src/components/BuyNFTDialog.tsx`

**Purpose:** Modal dialog for purchasing an NFT directly from the marketplace.

**Key Features:**
- Wallet connection check
- Transaction state management (confirming, processing, completed, failed)
- Price verification
- Contract method execution
- Transaction hash tracking
- Database transaction recording
- Error handling with user feedback
- Success notifications

**Props Interface:**
```typescript
interface BuyNFTDialogProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TransactionStatus = "idle" | "confirming" | "processing" | "completed" | "failed";
```

**Usage Example:**
```tsx
import BuyNFTDialog from './BuyNFTDialog';
import { useState } from 'react';

export function NFTDetailPage({ nft }) {
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  return (
    <>
      <button onClick={() => setBuyDialogOpen(true)}>
        Buy Now
      </button>
      <BuyNFTDialog
        nft={nft}
        isOpen={buyDialogOpen}
        onClose={() => setBuyDialogOpen(false)}
        onSuccess={() => {
          // Refresh NFT data
        }}
      />
    </>
  );
}
```

**Key Dependencies:**
- VeChain contract interaction utilities
- Toast notifications
- Query client for data invalidation
- Wallet hooks

---

### 2. EditListingDialog

**Location:** `client/src/components/EditListingDialog.tsx`

**Purpose:** Modal for editing NFT listing settings (price, sale status, auction settings).

**Key Features:**
- Toggle sale/auction listing
- Price input with currency selection
- Auction duration presets (1h, 6h, 12h, 1d, 3d, 7d)
- Custom date picker for auction end date
- Form validation
- Loading states
- Smooth transitions

**Props Interface:**
```typescript
interface EditListingDialogProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Usage Example:**
```tsx
import EditListingDialog from './EditListingDialog';
import { useState } from 'react';

export function MyNFTItem({ nft }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <button onClick={() => setEditOpen(true)}>Edit Listing</button>
      <EditListingDialog
        nft={nft}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
```

---

## Transaction Flow Components

### 1. TransactionConfirmDialog

**Location:** `client/src/components/TransactionConfirmDialog.tsx`

**Purpose:** Generic transaction confirmation modal for any blockchain transaction (mint, buy, sell, bid, transfer).

**Key Features:**
- Multiple transaction types (mint, buy, sell, bid, transfer)
- Transaction state display (idle, confirming, processing, completed, failed)
- NFT image preview
- Price and gas estimation display
- Recipient/contract address display
- WebSocket notification integration
- Error handling with detailed messages
- Transaction hash display
- Blockchain explorer links

**Props Interface:**
```typescript
export interface TransactionDetails {
  type: 'mint' | 'buy' | 'sell' | 'bid' | 'transfer';
  title: string;
  description: string;
  metadata?: {
    nftName?: string;
    nftImage?: string;
    price?: string;
    currency?: string;
    recipient?: string;
    contractAddress?: string;
    methodName?: string;
    gasEstimate?: string;
  };
  onConfirm: () => Promise<{ txid: string; success: boolean }>;
  onSuccess?: (txid: string) => void;
  onCancel?: () => void;
}

interface TransactionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetails;
}
```

**Usage Example:**
```tsx
import TransactionConfirmDialog from './TransactionConfirmDialog';
import { useState } from 'react';

export function MintNFT() {
  const [txOpen, setTxOpen] = useState(false);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);

  const handleMint = async () => {
    setTransaction({
      type: 'mint',
      title: 'Mint NFT',
      description: 'Create and mint your new NFT',
      metadata: {
        nftName: 'My Artwork',
        nftImage: '/image.jpg',
        gasEstimate: '0.001 VET'
      },
      onConfirm: async () => {
        // Execute mint logic
        return { txid: 'tx123', success: true };
      },
      onSuccess: (txid) => {
        console.log('Minted successfully:', txid);
      }
    });
    setTxOpen(true);
  };

  return (
    <>
      <button onClick={handleMint}>Mint NFT</button>
      {transaction && (
        <TransactionConfirmDialog
          isOpen={txOpen}
          onClose={() => setTxOpen(false)}
          transaction={transaction}
        />
      )}
    </>
  );
}
```

---

## User & Wallet Components

### 1. DAppKitWalletButton

**Location:** `client/src/components/DAppKitWalletButton.tsx`

**Purpose:** Advanced wallet connection button using VeChain's DAppKit SDK.

**Key Features:**
- Multiple wallet support (VeWorld, Sync2, WalletConnect)
- Automatic wallet detection
- Wallet availability checking
- Real-time wallet installation links
- Connection error handling
- Formatted address display
- Disconnect functionality
- Mobile device detection
- Sheet-based wallet selection UI

**Props Interface:**
```typescript
// No props - uses context for state management
```

**Usage Example:**
```tsx
import DAppKitWalletButton from './DAppKitWalletButton';

export function Header() {
  return (
    <header>
      <nav>
        <DAppKitWalletButton />
      </nav>
    </header>
  );
}
```

**Dependencies:**
- `@vechain/dapp-kit` for wallet integration
- Context provider: `VeChainDAppKitContext`

---

### 2. VeChainWalletButton

**Location:** `client/src/components/VeChainWalletButton.tsx`

**Purpose:** Simplified wallet button that wraps DAppKit wallet dialog.

**Key Features:**
- Simple connect/disconnect UI
- Wallet dialog integration
- Custom styling support

**Props Interface:**
```typescript
interface VeChainWalletButtonProps {
  className?: string;
}
```

---

### 3. WalletButton

**Location:** `client/src/components/WalletButton.tsx`

**Purpose:** Basic wallet connection button component.

**Key Features:**
- Simple wallet connection
- Address display
- Disconnect option
- Error handling

---

### 4. DAppKitWalletDialog

**Location:** `client/src/components/DAppKitWalletDialog.tsx`

**Purpose:** Dialog component for wallet selection and connection.

**Key Features:**
- Wallet options display
- Installation prompts for unavailable wallets
- External links to wallet providers
- Error messages
- Loading states

---

## Layout Components

### 1. Header

**Location:** `client/src/components/Header.tsx`

**Purpose:** Main navigation header with logo, menu, theme toggle, and wallet button.

**Key Features:**
- Fixed positioning with shadow on scroll
- Responsive navigation (desktop nav + mobile hamburger menu)
- Theme toggle
- Wallet connection button
- Mobile menu overlay
- Links to key pages (Home, Explore, Create, Artists, Games)
- Brand logo

**Usage Example:**
```tsx
import Header from './Header';

export function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
    </>
  );
}
```

---

### 2. Footer

**Location:** `client/src/components/Footer.tsx`

**Purpose:** Footer with links, social media, and legal information.

**Key Features:**
- Multiple link sections (Marketplace, My Account, Resources)
- Social media icons
- Legal links (Privacy Policy, Terms)
- Brand information
- Responsive grid layout
- Copyright notice

**Usage Example:**
```tsx
import Footer from './Footer';
import Header from './Header';
import Layout from './Layout';

export function AppLayout({ children }) {
  return (
    <Layout>
      <Header />
      <main>{children}</main>
      <Footer />
    </Layout>
  );
}
```

---

### 3. Layout

**Location:** `client/src/components/Layout.tsx`

**Purpose:** Generic layout wrapper component.

**Key Features:**
- Children rendering
- Consistent spacing

**Props Interface:**
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

---

### 4. Hero

**Location:** `client/src/components/Hero.tsx`

**Purpose:** Full-width hero section with carousel/slideshow.

**Key Features:**
- Auto-rotating carousel
- Manual navigation (previous/next buttons)
- Smooth transitions
- Responsive design
- Call-to-action buttons

---

## Common UI Atoms

### 1. Button

**Location:** `client/src/components/ui/button.tsx`

**Purpose:** Reusable button component with multiple variants and sizes.

**Key Features:**
- Multiple variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Multiple sizes: `default`, `sm`, `lg`, `icon`
- Hover and focus states
- Disabled states
- Icon support with automatic sizing
- Smooth transitions
- Accessibility-focused

**Props Interface:**
```typescript
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

**Usage Examples:**
```tsx
import { Button } from '@/components/ui/button';

// Default button
<Button>Click me</Button>

// Secondary variant
<Button variant="secondary">Secondary</Button>

// Outline variant
<Button variant="outline">Outline</Button>

// Large button with icon
<Button size="lg">
  <Icon className="mr-2" />
  Large Button
</Button>

// Icon only button
<Button size="icon">
  <Icon />
</Button>
```

---

### 2. Badge

**Location:** `client/src/components/ui/badge.tsx`

**Purpose:** Small label/badge component for status, tags, and labels.

**Key Features:**
- Multiple variants: `default`, `secondary`, `destructive`, `outline`
- Rounded styling
- Smooth transitions
- Small, fixed sizing
- Perfect for tags and status indicators

**Props Interface:**
```typescript
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
```

**Usage Examples:**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Urgent</Badge>
<Badge variant="outline">Outline</Badge>
```

---

### 3. Input

**Location:** `client/src/components/ui/input.tsx`

**Purpose:** Standard text input component with consistent styling.

**Key Features:**
- Full width by default
- Border and focus ring styling
- Placeholder support
- Disabled state styling
- File input support
- Accessible

**Props Interface:**
```typescript
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Usage Examples:**
```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Enter your name" />
<Input type="email" placeholder="email@example.com" />
<Input type="number" placeholder="Price" />
<Input type="file" />
```

---

### 4. Textarea

**Location:** `client/src/components/ui/textarea.tsx`

**Purpose:** Multi-line text input component.

**Key Features:**
- Similar styling to Input
- Resizable
- Placeholder support
- Accessible

**Props Interface:**
```typescript
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
```

**Usage Example:**
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea 
  placeholder="Description" 
  className="min-h-32"
/>
```

---

### 5. Dialog

**Location:** `client/src/components/ui/dialog.tsx` (Radix UI wrapper)

**Purpose:** Modal dialog component built on Radix UI.

**Key Features:**
- Accessible modal
- Header and footer sections
- Close button
- Overlay backdrop
- Smooth animations

**Components:**
- `Dialog` - Container
- `DialogTrigger` - Button to open
- `DialogContent` - Modal content
- `DialogHeader` - Header section
- `DialogTitle` - Modal title
- `DialogDescription` - Modal description
- `DialogFooter` - Footer section

**Usage Example:**
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog description goes here
          </DialogDescription>
        </DialogHeader>
        <div>
          {/* Content */}
        </div>
        <DialogFooter>
          <Button>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 6. Alert

**Location:** `client/src/components/ui/alert.tsx` (Radix UI wrapper)

**Purpose:** Alert/notification component for warnings, errors, and info.

**Key Features:**
- Multiple alert types: `default`, `destructive`
- Icon support
- Title and description
- Smooth animations

**Components:**
- `Alert` - Container
- `AlertTitle` - Alert title
- `AlertDescription` - Alert content

**Usage Example:**
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    This is an informational alert.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong.
  </AlertDescription>
</Alert>
```

---

### 7. Skeleton

**Location:** `client/src/components/ui/skeleton.tsx`

**Purpose:** Placeholder/loading skeleton component.

**Key Features:**
- Animated pulse effect
- Customizable dimensions
- Perfect for loading states
- Smooth animation

**Usage Example:**
```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Loading card
<div className="border rounded-lg p-4">
  <Skeleton className="h-48 w-full rounded-lg mb-4" />
  <Skeleton className="h-4 w-3/4 mb-2" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

---

### 8. Select

**Location:** `client/src/components/ui/select.tsx` (Radix UI wrapper)

**Purpose:** Dropdown/select component.

**Components:**
- `Select` - Container
- `SelectTrigger` - Button to open dropdown
- `SelectValue` - Display selected value
- `SelectContent` - Dropdown content
- `SelectItem` - Individual option
- `SelectGroup` - Grouped options

**Usage Example:**
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

### 9. Tooltip

**Location:** `client/src/components/ui/tooltip.tsx` (Radix UI wrapper)

**Purpose:** Hover tooltip component.

**Components:**
- `TooltipProvider` - Context provider (wrap at app root)
- `Tooltip` - Container
- `TooltipTrigger` - Element that triggers tooltip
- `TooltipContent` - Tooltip content

**Usage Example:**
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover over me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### 10. Switch

**Location:** `client/src/components/ui/switch.tsx` (Radix UI wrapper)

**Purpose:** Toggle switch component.

**Usage Example:**
```tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
  <Switch id="terms" />
  <Label htmlFor="terms">I agree to the terms</Label>
</div>
```

---

### 11. Carousel

**Location:** `client/src/components/ui/carousel.tsx`

**Purpose:** Image carousel/slideshow component.

**Key Features:**
- Embla Carousel based
- Responsive
- Touch/keyboard navigation
- Auto-scroll option

---

### 12. FileUpload

**Location:** `client/src/components/ui/file-upload.tsx`

**Purpose:** File upload input component.

**Key Features:**
- Drag and drop support
- File type validation
- Preview
- Progress indication

---

### 13. Calendar

**Location:** `client/src/components/ui/calendar.tsx`

**Purpose:** Date picker calendar component.

**Key Features:**
- Month/year navigation
- Date selection
- Week row display

---

### 14. Popover

**Location:** `client/src/components/ui/popover.tsx`

**Purpose:** Floating popover component built on Radix UI.

**Components:**
- `Popover` - Container
- `PopoverTrigger` - Element that triggers popover
- `PopoverContent` - Popover content

---

### 15. Sheet

**Location:** `client/src/components/ui/sheet.tsx`

**Purpose:** Side panel/drawer component.

**Components:**
- `Sheet` - Container
- `SheetTrigger` - Button to open
- `SheetContent` - Panel content
- `SheetHeader` - Header section
- `SheetTitle` - Panel title
- `SheetDescription` - Panel description
- `SheetFooter` - Footer section

---

## Implementation Notes

### Design System
- **UI Library:** Shadcn/ui components built on Radix UI
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** CSS transitions and Tailwind animations
- **Dark Mode:** Built-in support via CSS variables

### State Management
- **Data Fetching:** TanStack React Query (@tanstack/react-query)
- **Routing:** Wouter (lightweight router)
- **Context API:** For global state (wallet, auth, theme)

### Key Dependencies
```json
{
  "react": "^18.x",
  "react-query": "@tanstack/react-query",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x",
  "@radix-ui/react-*": "various",
  "wouter": "^latest",
  "@vechain/dapp-kit": "For wallet integration"
}
```

### Common Patterns

#### 1. Data Fetching
```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['/api/endpoint'],
  queryFn: () => fetch('/api/endpoint').then(r => r.json())
});
```

#### 2. Navigation
```tsx
import { useLocation } from 'wouter';

const [, navigate] = useLocation();
navigate('/path');
```

#### 3. Notifications
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();
toast({
  title: "Success",
  description: "Operation completed",
});
```

#### 4. Authentication Check
```tsx
import { useAuth } from '@/hooks/useAuth';

const { user } = useAuth();
if (!user) {
  return <p>Please log in</p>;
}
```

#### 5. Wallet Integration
```tsx
import { useVeChainWallet } from '@/context/VeChainWalletProvider';

const { walletInfo, isConnected } = useVeChainWallet();
```

### Responsive Design
All components follow mobile-first responsive design:
- **Mobile:** `sm:` breakpoint at 640px
- **Tablet:** `md:` breakpoint at 768px
- **Desktop:** `lg:` breakpoint at 1024px
- **Large Desktop:** `xl:` breakpoint at 1280px

### Accessibility
- All components support keyboard navigation
- ARIA labels and roles included
- Focus states visible
- Color contrast compliant
- Semantic HTML used throughout

### Performance Optimizations
- Image lazy loading
- Query result caching
- Component memoization where needed
- Debounced search
- Pagination for large lists

---

## Migration Checklist

When importing these components into your Sovereign Network marketplace:

- [ ] Install all required dependencies
- [ ] Copy component files maintaining folder structure
- [ ] Update import paths relative to your project structure
- [ ] Configure Tailwind CSS with your color scheme
- [ ] Set up context providers (Auth, Wallet, Theme)
- [ ] Update API endpoints to match your backend
- [ ] Configure wallet integration for your network
- [ ] Test responsive design on all breakpoints
- [ ] Set up loading states and error boundaries
- [ ] Implement your custom branding/theming

---

## Support & Customization

These components are fully customizable:
- Modify Tailwind classes for different styling
- Adjust props to fit your data models
- Extend with additional features as needed
- Compose multiple components for complex UIs

For questions about specific component implementation, refer to the source files in the `client/src/components/` directory.
