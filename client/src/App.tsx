import * as React from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { VeChainDAppKitProvider } from "./contexts/VeChainDAppKitContext";
import { WalletProvider } from "./contexts/WalletContext";
import { AuthProvider } from "./contexts/AuthContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import NFTDetail from "./pages/NFTDetail";
import EditNFT from "./pages/EditNFT";
import Artists from "./pages/Artists";
import Badges from "./pages/Badges";
import Games from "./pages/Games"
import WalletTest from "./pages/WalletTest"; // Add wallet testing page
import WalletTestAdvanced from "./pages/WalletTestAdvanced"; // Add advanced wallet testing page
import NotFound from "./pages/not-found";

// Footer pages
import HelpCenter from "./pages/footer/HelpCenter";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy";
import TermsOfService from "./pages/footer/TermsOfService";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/create" component={Create} />
        <Route path="/profile/:id?" component={Profile} />
        <Route path="/edit-profile" component={EditProfile} />
        <Route path="/nft/:id" component={NFTDetail} />
        <Route path="/edit-nft/:id" component={EditNFT} />
        <Route path="/artists" component={Artists} />
        <Route path="/badges" component={Badges} />
        <Route path="/wallet-test" component={WalletTest} />
        <Route path="/test-wallet" component={WalletTest} />
        <Route path="/wallet-test-advanced" component={WalletTestAdvanced} />
        <Route path="/games" component={Games} />
        <Route path="/games/*" component={Games} />
        
        {/* Footer pages */}
        <Route path="/help" component={HelpCenter} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        
        <Route path="/:rest*" component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate minimal load time to prevent flash
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  if (isLoading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <VeChainDAppKitProvider>
          <WalletProvider>
            <AuthProvider>
              <Router />
              <Toaster />
            </AuthProvider>
          </WalletProvider>
        </VeChainDAppKitProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// Basic error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default App;
