import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-secondary-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-primary font-bold text-2xl mb-4">
              <span className="text-white">Ve</span>Collab
            </div>
            <p className="text-gray-400 mb-6">
              The premier decentralized marketplace for VeChain NFTs. Buy, sell, and collect unique digital assets.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-discord"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-telegram"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Marketplace</h3>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-gray-400 hover:text-white transition-colors">All NFTs</Link></li>
              <li><Link href="/explore?category=art" className="text-gray-400 hover:text-white transition-colors">Art</Link></li>
              <li><Link href="/explore?category=collectibles" className="text-gray-400 hover:text-white transition-colors">Collectibles</Link></li>
              <li><Link href="/explore?category=photography" className="text-gray-400 hover:text-white transition-colors">Photography</Link></li>
              <li><Link href="/explore?category=music" className="text-gray-400 hover:text-white transition-colors">Music</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">My Account</h3>
            <ul className="space-y-2">
              <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link></li>
              <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">My Collections</Link></li>
              <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Favorites</Link></li>
              <li><Link href="/create" className="text-gray-400 hover:text-white transition-colors">Create</Link></li>
              <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Settings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Platform Status</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Partners</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Newsletter</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© 2025 VeCollab. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
