import { Link } from "wouter";
import { Wallet, Upload, Paintbrush, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateAndSell() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-poppins text-secondary mb-4">Create and sell your NFTs</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Join the VeCollab community and start creating, collecting, and trading unique digital assets on the VeChain blockchain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-secondary">Set up your wallet</h3>
            <p className="text-gray-600">Connect your VeChain wallet to start creating and trading NFTs on our platform.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-secondary">Create your collection</h3>
            <p className="text-gray-600">Upload your work, add a title and description, and customize your NFTs with properties.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Paintbrush className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-secondary">Add your NFTs</h3>
            <p className="text-gray-600">Add your digital creations, set prices, and define your trading preferences.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="text-primary text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-secondary">List them for sale</h3>
            <p className="text-gray-600">Choose between auctions, fixed-price listings, and offers to sell your NFTs.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/create">
            <Button className="bg-primary hover:bg-primary-dark text-white font-poppins font-semibold py-3 px-8 rounded-full transition-colors">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
