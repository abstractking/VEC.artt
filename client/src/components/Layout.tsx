
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import WalletModal from "./WalletModal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-background pt-20">
        {children}
      </main>
      <Footer />
      <WalletModal />
    </div>
  );
}
