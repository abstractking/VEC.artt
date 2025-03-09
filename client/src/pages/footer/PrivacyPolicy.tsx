import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg font-medium">Last Updated: March 09, 2025</p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p>
                Welcome to VeCollab ("we," "our," or "us"). We are committed to protecting your privacy 
                and handling your data with transparency and care. This Privacy Policy outlines how we 
                collect, use, disclose, and safeguard your information when you visit our website or use 
                our services.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mt-6 mb-3">2.1 Personal Information</h3>
              <p>
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Create an account or profile</li>
                <li>Connect your wallet</li>
                <li>Create, buy, or sell NFTs</li>
                <li>Contact our support team</li>
                <li>Subscribe to newsletters or marketing communications</li>
              </ul>
              <p>
                This information may include your name, email address, wallet address, profile picture, 
                social media handles, and any other information you choose to provide.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">2.2 Blockchain Data</h3>
              <p>
                As a decentralized application, transactions on VeCollab occur on the public VeChain 
                blockchain. Information related to these transactions, including wallet addresses and 
                transaction details, are publicly accessible on the blockchain.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">2.3 Automatically Collected Information</h3>
              <p>
                We automatically collect certain information when you visit our website or use our 
                services, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Device information (browser type, operating system, device type)</li>
                <li>IP address</li>
                <li>Pages visited and features used</li>
                <li>Time and date of visits</li>
                <li>Referring websites or applications</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p>
                We use the collected information for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Providing, maintaining, and improving our services</li>
                <li>Processing transactions and fulfilling requests</li>
                <li>Sending transactional and marketing communications</li>
                <li>Responding to your inquiries and providing customer support</li>
                <li>Monitoring and analyzing usage and trends</li>
                <li>Protecting against fraudulent or illegal activity</li>
                <li>Complying with legal obligations</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
              <p>
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>With service providers who assist us in operating our platform</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transaction (e.g., merger or acquisition)</li>
                <li>With your consent or at your direction</li>
              </ul>
              <p>
                Information posted on the blockchain, including wallet addresses and transaction details, 
                is public by nature and accessible to anyone.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access, correct, or delete your personal information</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent (where applicable)</li>
              </ul>
              <p>
                Please note that data stored on the blockchain cannot be modified or deleted due to the 
                immutable nature of blockchain technology.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Security</h2>
              <p>
                We implement reasonable security measures to protect your information. However, no method 
                of transmission over the internet or electronic storage is completely secure. We cannot 
                guarantee absolute security of your data.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you believe we have collected 
                information from a child under 13, please contact us.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <p>Email: privacy@vecollab.io</p>
              <p>Address: 123 Blockchain Street, Digital City, VC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}