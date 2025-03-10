import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWallet } from '@/hooks/useVechain';
import { getNetwork } from '@/lib/vechain';

export default function FaucetLink() {
  const { isConnected, useRealWallet } = useWallet();
  const networkConfig = getNetwork();
  
  if (!isConnected || !useRealWallet || networkConfig.name !== 'TestNet') {
    return null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 h-7"
            onClick={() => window.open('https://faucet.vecha.in/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Get Test Tokens
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Get VET and VTHO tokens for testing on TestNet</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}