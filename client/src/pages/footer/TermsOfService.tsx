import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline inline-flex items-center">
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Terms of Service
        </h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg font-medium">Last Updated: March 09, 2025</p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                Welcome to VeCollab. By accessing or using our platform, you agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our 
                services.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Platform:</strong> The VeCollab website and decentralized application.</li>
                <li><strong>User:</strong> Any individual or entity that accesses or uses the Platform.</li>
                <li><strong>NFT:</strong> Non-fungible token, a unique digital asset recorded on a blockchain.</li>
                <li><strong>Creator:</strong> A User who creates, mints, or uploads NFTs to the Platform.</li>
                <li><strong>Collector:</strong> A User who purchases, trades, or acquires NFTs.</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Eligibility</h2>
              <p>
                To use our Platform, you must be at least 18 years old and have the legal capacity to 
                enter into a binding agreement. By using our Platform, you represent and warrant that 
                you meet these requirements.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Accounts</h2>
              <p>
                To access certain features of the Platform, you must create an account and connect a 
                compatible blockchain wallet. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Maintaining the security of your wallet and private keys</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and up-to-date information</li>
                <li>Promptly notifying us of any unauthorized use</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Platform Rules</h2>
              <h3 className="text-xl font-medium mt-6 mb-3">5.1 General Conduct</h3>
              <p>
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Use the Platform for illegal, fraudulent, or unauthorized purposes</li>
                <li>Attempt to interfere with or disrupt the Platform's operation</li>
                <li>Circumvent any security measures we implement</li>
              </ul>
              
              <h3 className="text-xl font-medium mt-6 mb-3">5.2 NFT Creation and Sales</h3>
              <p>
                As a Creator, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>You own or have proper rights to the content you mint as NFTs</li>
                <li>Your NFTs do not infringe on any third-party rights</li>
                <li>You have the legal right to set royalty or collaboration terms</li>
                <li>Your NFTs comply with our content policies</li>
              </ul>
              
              <h3 className="text-xl font-medium mt-6 mb-3">5.3 Prohibited Content</h3>
              <p>
                You may not create, sell, or trade NFTs that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Infringe on intellectual property rights</li>
                <li>Contain illegal, harmful, or offensive content</li>
                <li>Promote hate speech, discrimination, or violence</li>
                <li>Involve fraud, scams, or market manipulation</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Fees and Payments</h2>
              <p>
                Our Platform may charge fees for certain transactions, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Platform fees on primary and secondary sales</li>
                <li>Gas fees for blockchain transactions</li>
                <li>Creator royalties on secondary sales</li>
              </ul>
              <p>
                All fees are disclosed at the time of transaction. By using our Platform, you agree to pay 
                all applicable fees. All transactions are final and non-refundable, except as required by law.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Ownership and Licenses</h2>
              <h3 className="text-xl font-medium mt-6 mb-3">7.1 Platform Content</h3>
              <p>
                The Platform, including its design, text, graphics, interfaces, and code, is owned by 
                VeCollab and protected by intellectual property laws. You may not copy, modify, distribute, 
                or create derivative works without our express permission.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">7.2 NFT Ownership</h3>
              <p>
                When you purchase an NFT, you own the token itself but not necessarily the underlying content 
                or intellectual property rights. The specific rights granted to NFT owners are determined by 
                the Creator and should be specified in the NFT's description or associated smart contract.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimers</h2>
              <p>
                THE PLATFORM AND ALL CONTENT ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM 
                ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, 
                AVAILABILITY, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not guarantee:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>The value, rarity, or uniqueness of any NFT</li>
                <li>The availability or functionality of the VeChain blockchain</li>
                <li>The continued availability of NFTs or their metadata</li>
                <li>The security of third-party wallets or services</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, 
                ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE PLATFORM.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless VeCollab and its officers, directors, 
                employees, and agents from any claims, damages, losses, liabilities, costs, and expenses 
                (including reasonable attorneys' fees) arising from your use of the Platform or violation 
                of these Terms.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Modifications</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of significant 
                changes by posting the updated Terms on the Platform. Your continued use of the Platform after 
                such changes constitutes acceptance of the new Terms.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], 
                without regard to its conflict of laws principles.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">13. Dispute Resolution</h2>
              <p>
                Any dispute arising from these Terms or your use of the Platform shall be resolved through 
                binding arbitration in [Location] in accordance with the rules of [Arbitration Authority].
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Information</h2>
              <p>
                If you have any questions or concerns about these Terms, please contact us at:
              </p>
              <p>Email: legal@vecollab.io</p>
              <p>Address: 123 Blockchain Street, Digital City, VC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}