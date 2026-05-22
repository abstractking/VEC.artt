# VeCollab Components - Quick Reference & Implementation Guide

A quick reference guide with copy-paste code snippets and implementation checklists.

---

## Quick Setup

### 1. Install Dependencies

```bash
npm install react react-dom
npm install @tanstack/react-query
npm install wouter
npm install tailwindcss postcss autoprefixer
npm install lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tooltip @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-sheet @radix-ui/react-alert-dialog @radix-ui/react-carousel @radix-ui/react-popover
npm install class-variance-authority clsx tailwind-merge
npm install date-fns
```

### 2. Configure Tailwind CSS

**tailwind.config.js:**
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        destructive: "hsl(var(--destructive))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
      },
    },
  },
}
```

### 3. CSS Variables Setup

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.6%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.6%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 9.0%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --primary: 220 13% 13%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --ring: 220 13% 13%;
  }

  .dark {
    --background: 0 0% 3.6%;
    --foreground: 0 0% 98.2%;
    --card: 0 0% 3.6%;
    --card-foreground: 0 0% 98.2%;
    --popover: 0 0% 3.6%;
    --popover-foreground: 0 0% 98.2%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 98.2%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98.2%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --primary: 0 0% 98.2%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98.2%;
    --ring: 0 0% 98.2%;
  }
}
```

---

## Component Copy-Paste Snippets

### NFT Grid with Search

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchBar from './SearchBar';
import NFTCard from './NFTCard';
import { Skeleton } from '@/components/ui/skeleton';

export function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ['/api/nfts', { search: searchTerm }],
  });

  const filteredNFTs = searchTerm 
    ? nfts.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : nfts;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Explore NFTs</h1>
        <SearchBar 
          placeholder="Search NFTs..."
          className="max-w-2xl"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border">
              <Skeleton className="w-full h-64 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map(nft => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### NFT Detail with Buy Dialog

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BuyNFTDialog from './BuyNFTDialog';
import TransactionConfirmDialog from './TransactionConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function NFTDetailPage() {
  const [location] = useLocation();
  const nftId = location.split('/').pop();
  
  const [buyOpen, setBuyOpen] = useState(false);
  const { data: nft, isLoading } = useQuery({
    queryKey: [`/api/nfts/${nftId}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="w-full h-96 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!nft) return <p>NFT not found</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="flex items-center justify-center">
          <img 
            src={nft.imageUrl} 
            alt={nft.name}
            className="w-full rounded-xl"
          />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-2">Collection</p>
            <h1 className="text-4xl font-bold">{nft.name}</h1>
          </div>

          {/* Price */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground mb-1">Current Price</p>
            <p className="text-2xl font-bold">{nft.price} {nft.currency}</p>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            {nft.isForSale && <Badge>For Sale</Badge>}
            {nft.isBiddable && <Badge variant="secondary">Accepting Bids</Badge>}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {nft.isForSale && (
              <Button 
                className="w-full h-12 text-lg"
                onClick={() => setBuyOpen(true)}
              >
                Buy Now
              </Button>
            )}
            <Button variant="outline" className="w-full h-12">
              Make Offer
            </Button>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-bold mb-2">Description</h2>
            <p className="text-muted-foreground">{nft.metadata?.description}</p>
          </div>
        </div>
      </div>

      <BuyNFTDialog
        nft={nft}
        isOpen={buyOpen}
        onClose={() => setBuyOpen(false)}
      />
    </div>
  );
}
```

---

### Create/Mint Form with Transaction Confirmation

```tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TransactionConfirmDialog, { TransactionDetails } from './TransactionConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';

export function CreateNFTPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [txOpen, setTxOpen] = useState(false);
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    royalties: '10',
  });

  const handleMint = async () => {
    if (!formData.name || !formData.description || !formData.imageUrl) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setTxDetails({
      type: 'mint',
      title: 'Mint NFT',
      description: 'Create and mint your new NFT',
      metadata: {
        nftName: formData.name,
        nftImage: formData.imageUrl,
        gasEstimate: '0.001 VET'
      },
      onConfirm: async () => {
        // Call your mint API
        const response = await fetch('/api/nfts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        return { 
          txid: result.transactionHash, 
          success: !!result.id 
        };
      },
      onSuccess: (txid) => {
        toast({
          title: 'NFT Minted!',
          description: `Transaction: ${txid}`,
        });
      }
    });
    
    setTxOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create NFT</h1>

      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-2">Upload Image *</label>
          <FileUpload 
            accept="image/*"
            onFileSelect={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                setFormData({ 
                  ...formData, 
                  imageUrl: e.target?.result as string 
                });
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block font-semibold mb-2">NFT Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Awesome NFT"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2">Description *</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your NFT..."
            className="min-h-32"
          />
        </div>

        {/* Royalties */}
        <div>
          <label className="block font-semibold mb-2">Royalties (%)</label>
          <Input
            type="number"
            value={formData.royalties}
            onChange={(e) => setFormData({ ...formData, royalties: e.target.value })}
            placeholder="10"
            min="0"
            max="50"
          />
        </div>

        {/* Submit */}
        <Button 
          className="w-full h-12 text-lg"
          onClick={handleMint}
        >
          Create NFT
        </Button>
      </div>

      {txDetails && (
        <TransactionConfirmDialog
          isOpen={txOpen}
          onClose={() => {
            setTxOpen(false);
            setTxDetails(null);
          }}
          transaction={txDetails}
        />
      )}
    </div>
  );
}
```

---

### Collection Page

```tsx
import { useQuery } from '@tanstack/react-query';
import CollectionCard from './CollectionCard';
import { Skeleton } from '@/components/ui/skeleton';

export function CollectionsPage() {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['/api/collections'],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Collections</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border overflow-hidden">
              <Skeleton className="w-full h-40" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <CollectionCard 
              key={collection.id} 
              collection={collection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Creator Showcase

```tsx
import { useQuery } from '@tanstack/react-query';
import CreatorCard from './CreatorCard';
import { Skeleton } from '@/components/ui/skeleton';

export function CreatorsPage() {
  const { data: creators = [], isLoading } = useQuery({
    queryKey: ['/api/users?role=creator'],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Top Creators</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {creators.map(creator => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Wallet Connection Integration

```tsx
import { useState } from 'react';
import DAppKitWalletButton from './DAppKitWalletButton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function WalletIntegration() {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      {/* Wallet Button */}
      <div className="flex items-center gap-4">
        <DAppKitWalletButton />
      </div>

      {/* Usage Example */}
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Wallet Status</h3>
        <p className="text-sm text-muted-foreground">
          Connect your wallet above to start buying and selling NFTs
        </p>
      </div>
    </div>
  );
}
```

---

## Common Patterns

### 1. Protected Component (Auth Required)

```tsx
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function ProtectedAction() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <p className="mb-4">You need to log in to continue</p>
        <Button onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return <div>{/* Your protected content */}</div>;
}
```

---

### 2. Error Boundary

```tsx
import { Component } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

---

### 3. Data Fetching with Cache

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export function DataFetching() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/nfts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
  };

  return (
    <div>
      <Button onClick={handleRefresh} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Refresh'}
      </Button>
      
      {error && <p>Error: {(error as Error).message}</p>}
      {data && <p>Total items: {data.length}</p>}
    </div>
  );
}
```

---

### 4. Form Validation

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ValidatedForm() {
  const [formData, setFormData] = useState({ email: '', price: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Price must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log('Form is valid:', formData);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{errors.email}</AlertDescription>
          </Alert>
        )}
      </div>

      <div>
        <Input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
        {errors.price && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{errors.price}</AlertDescription>
          </Alert>
        )}
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Submit
      </Button>
    </div>
  );
}
```

---

## Hooks Reference

### useAuth
```tsx
const { user, isLoading, login, logout } = useAuth();
```

### useToast
```tsx
const { toast } = useToast();
toast({
  title: 'Success',
  description: 'Operation completed',
  variant: 'default' | 'destructive'
});
```

### useQuery
```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['key'],
  queryFn: async () => { /* ... */ },
  staleTime: 5000,
  cacheTime: 10000,
});
```

### useMutation
```tsx
const mutation = useMutation({
  mutationFn: async (data) => { /* ... */ },
  onSuccess: () => { /* ... */ },
  onError: () => { /* ... */ },
});

mutation.mutate(data);
```

---

## Testing Components

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('NFT Card renders with name', () => {
  const mockNFT = {
    id: '1',
    name: 'Test NFT',
    imageUrl: '/image.jpg',
    price: '100',
    currency: 'VET',
    creatorId: '1',
    ownerId: '1',
    isForSale: true,
    isBiddable: false,
  };

  render(<NFTCard nft={mockNFT} />);
  
  expect(screen.getByText('Test NFT')).toBeInTheDocument();
  expect(screen.getByText('100 VET')).toBeInTheDocument();
});

test('Button click handler works', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await userEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalled();
});
```

---

## Performance Optimization Tips

1. **Memoize Components:**
   ```tsx
   import { memo } from 'react';
   const NFTCard = memo(function NFTCard({ nft }) {
     return /* ... */;
   });
   ```

2. **Lazy Load Routes:**
   ```tsx
   import { lazy, Suspense } from 'react';
   const ExplorePage = lazy(() => import('./ExplorePage'));
   
   <Suspense fallback={<Loader />}>
     <ExplorePage />
   </Suspense>
   ```

3. **Virtualize Large Lists:**
   ```tsx
   import { useWindowScroll } from 'react-use';
   // Use for lists with 100+ items
   ```

4. **Debounce Search:**
   ```tsx
   import { useDebouncedValue } from '@mantine/hooks';
   const [searchTerm, setSearchTerm] = useState('');
   const debouncedTerm = useDebouncedValue(searchTerm, 300);
   ```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] API endpoints updated for production
- [ ] Images optimized and cached
- [ ] Error boundaries added
- [ ] Loading states working
- [ ] Responsive design tested
- [ ] Accessibility audit passed
- [ ] Performance audit passed (Lighthouse >90)
- [ ] Security headers configured
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Error logging configured

---

For more details, refer to the main `REUSABLE_COMPONENTS_GUIDE.md` file.
