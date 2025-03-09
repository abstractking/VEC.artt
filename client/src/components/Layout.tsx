import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import WalletModal from "./WalletModal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WalletModal />
    </>
  );
}
