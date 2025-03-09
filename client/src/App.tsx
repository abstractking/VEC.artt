import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { WalletProvider } from "./contexts/WalletContext";
import { AuthProvider } from "./contexts/AuthContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import NFTDetail from "./pages/NFTDetail";
import Artists from "./pages/Artists";
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
        <Route path="/nft/:id" component={NFTDetail} />
        <Route path="/artists" component={Artists} />
        
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
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
