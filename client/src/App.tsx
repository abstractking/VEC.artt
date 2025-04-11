import * as React from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";

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
// Wallet test pages have been removed
import NotFound from "./pages/not-found";

// Game components (lazy loaded)
import AsteroidZunaGame from "./pages/games/AsteroidZuna";
import GalacticHitGame from "./pages/games/GalacticHit";

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
        <Route path="/games" component={Games} />
        <Route path="/games/asteroid-zuna" component={AsteroidZunaGame} />
        <Route path="/games/galactic-hit" component={GalacticHitGame} />
        
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
        <Router />
        <Toaster />
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
