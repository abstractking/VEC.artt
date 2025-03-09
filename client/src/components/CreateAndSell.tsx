import { Link } from "wouter";
import { Wallet, Upload, Paintbrush, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateAndSell() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-poppins text-foreground mb-4">Create and sell your NFTs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Join the VeCollab community and start creating, collecting, and trading unique digital assets on the VeChain blockchain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-foreground">Set up your wallet</h3>
            <p className="text-muted-foreground">Connect your VeChain wallet to start creating and trading NFTs on our platform.</p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-foreground">Create your collection</h3>
            <p className="text-muted-foreground">Upload your work, add a title and description, and customize your NFTs with properties.</p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Paintbrush className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-foreground">Add your NFTs</h3>
            <p className="text-muted-foreground">Add your digital creations, set prices, and define your trading preferences.</p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-foreground">List them for sale</h3>
            <p className="text-muted-foreground">Choose between auctions, fixed-price listings, and offers to sell your NFTs.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/create">
            <Button className="font-poppins font-semibold py-3 px-8 rounded-full">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
