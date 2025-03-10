import React from 'react';
import { useWallet } from '@/hooks/useVechain';
import { Badge } from '@/components/ui/badge';
import { getNetwork } from '@/lib/vechain';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideShieldAlert, LucideShieldCheck } from 'lucide-react';

export default function NetworkIndicator() {
  const { isConnected, useRealWallet } = useWallet();
  const networkConfig = getNetwork();
  
  if (!isConnected) return null;
  
  const isTestNet = networkConfig.name === 'TestNet';
  const isMainNet = networkConfig.name === 'MainNet';
  
  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  let networkName: string;
  let Icon: React.ElementType;
  let tooltipText: string;
  
  if (!useRealWallet) {
    badgeVariant = 'outline';
    networkName = 'MOCK';
    Icon = LucideShieldAlert;
    tooltipText = 'Mock wallet mode - no real blockchain interactions';
  } else if (isTestNet) {
    badgeVariant = 'secondary';
    networkName = 'TESTNET';
    Icon = LucideShieldAlert;
    tooltipText = 'Connected to VeChain TestNet - Test transactions only';
  } else if (isMainNet) {
    badgeVariant = 'destructive';
    networkName = 'MAINNET';
    Icon = LucideShieldCheck;
    tooltipText = 'Connected to VeChain MainNet - Real transactions';
  } else {
    badgeVariant = 'outline';
    networkName = 'UNKNOWN';
    Icon = LucideShieldAlert;
    tooltipText = 'Unknown network configuration';
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={badgeVariant}
            className="ml-2 font-mono text-xs py-0 h-5 px-2 flex items-center gap-1"
          >
            <Icon size={12} />
            {networkName}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}