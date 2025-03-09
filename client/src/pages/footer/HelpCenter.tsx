import React from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Search, Mail, MessageCircle, FileText, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search our knowledge base or browse categories to find the information you need.
          </p>
          
          <div className="mt-8 max-w-xl mx-auto relative">
            <Input 
              type="text" 
              placeholder="Search for help articles..." 
              className="pr-12 h-12 text-base" 
            />
            <Search className="absolute right-4 top-3.5 text-gray-400 dark:text-gray-500 h-5 w-5" />
          </div>
        </div>

        <div className="mb-12">
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto h-auto p-1">
              <TabsTrigger value="getting-started" className="py-3">Getting Started</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="nft">NFTs</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="getting-started" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>What is VeCollab?</CardTitle>
                    <CardDescription>Learn about our NFT platform and ecosystem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      VeCollab is a decentralized marketplace built on VeChain blockchain that connects creators and collectors.
                    </p>
                    <Link href="/help/about-vecollab" className="text-primary hover:underline">
                      Read more →
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>How to Create an Account</CardTitle>
                    <CardDescription>Easy steps to join VeCollab</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Learn how to set up your profile, connect your wallet, and get started on VeCollab.
                    </p>
                    <Link href="/help/create-account" className="text-primary hover:underline">
                      Read more →
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Creating Your First NFT</CardTitle>
                    <CardDescription>A step-by-step guide for new creators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Everything you need to know about minting NFTs, setting royalties, and collaboration splits.
                    </p>
                    <Link href="/help/creating-nfts" className="text-primary hover:underline">
                      Read more →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="account" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management FAQ</CardTitle>
                  <CardDescription>Frequently asked questions about your VeCollab account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>How do I edit my profile?</AccordionTrigger>
                      <AccordionContent>
                        To edit your profile, go to your Profile page and click the "Edit Profile" button. 
                        You can change your username, bio, profile image, and cover photo.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>How do I recover my account if I lose access?</AccordionTrigger>
                      <AccordionContent>
                        Your VeCollab account is linked to your blockchain wallet. If you lose access to your wallet, 
                        you'll need to recover it using your wallet's recovery phrase or private key. VeCollab cannot 
                        recover your wallet for you.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Can I have multiple accounts?</AccordionTrigger>
                      <AccordionContent>
                        Yes, you can create multiple accounts using different wallet addresses. Each wallet address 
                        will have its own separate VeCollab account and profile.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                      <AccordionContent>
                        To delete your account, go to your Profile Settings and scroll to the bottom. Click on 
                        "Delete Account" and follow the instructions. Please note that while your profile data 
                        will be removed, your NFTs and transactions on the blockchain are permanent.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="nft" className="mt-8">
              {/* NFT Tab Content */}
              <Card>
                <CardHeader>
                  <CardTitle>NFT Creation and Management</CardTitle>
                  <CardDescription>Everything you need to know about NFTs on VeCollab</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Creating NFTs</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Learn how to mint NFTs on VeCollab, set properties, and manage royalties.
                    </p>
                    <Link href="/help/nft-creation" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Managing Collections</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create and organize your NFTs into collections for better visibility.
                    </p>
                    <Link href="/help/nft-collections" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Collaborating with Other Creators</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Learn how to use our collaboration features to split revenue with other creators.
                    </p>
                    <Link href="/help/nft-collaborations" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="marketplace" className="mt-8">
              {/* Marketplace Tab Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Buying and Selling NFTs</CardTitle>
                  <CardDescription>Learn how to navigate the VeCollab marketplace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">How to Buy NFTs</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Step-by-step guide for purchasing NFTs, placing bids, and managing your collection.
                    </p>
                    <Link href="/help/buying-nfts" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">How to Sell NFTs</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Learn how to list your NFTs for sale, set prices, and accept bids.
                    </p>
                    <Link href="/help/selling-nfts" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Fees and Royalties</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Understand marketplace fees, creator royalties, and transaction costs.
                    </p>
                    <Link href="/help/fees-royalties" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wallet" className="mt-8">
              {/* Wallet Tab Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Wallet and Transactions</CardTitle>
                  <CardDescription>Everything about VeChain wallets and blockchain transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Supported Wallets</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Information about VeChain wallets that work with VeCollab.
                    </p>
                    <Link href="/help/supported-wallets" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Understanding Gas Fees</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Learn about transaction fees on the VeChain blockchain.
                    </p>
                    <Link href="/help/gas-fees" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Transaction History</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      How to view and understand your transaction history.
                    </p>
                    <Link href="/help/transaction-history" className="text-primary hover:underline">
                      View detailed guide →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Still need help?
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <Mail className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <Button>Contact Support</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <MessageCircle className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Chat with our support team during business hours.
                </p>
                <Button>Start Chat</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <FileText className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle>Submit a Ticket</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create a support ticket for complex issues.
                </p>
                <Button>Open Ticket</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}