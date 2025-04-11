import { useVeChainDAppKit } from "@/contexts/VeChainDAppKitContext";
import { useWallet } from "@/contexts/WalletContext";

// Export useVeChain hook that redirects to our new DAppKit context
export function useVeChain() {
  return useVeChainDAppKit();
}

// Export useWallet hook that redirects to our WalletContext
export { useWallet };