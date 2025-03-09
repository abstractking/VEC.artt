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
              <li><Link href="/explore"><a className="text-gray-400 hover:text-white transition-colors">All NFTs</a></Link></li>
              <li><Link href="/explore?category=art"><a className="text-gray-400 hover:text-white transition-colors">Art</a></Link></li>
              <li><Link href="/explore?category=collectibles"><a className="text-gray-400 hover:text-white transition-colors">Collectibles</a></Link></li>
              <li><Link href="/explore?category=photography"><a className="text-gray-400 hover:text-white transition-colors">Photography</a></Link></li>
              <li><Link href="/explore?category=music"><a className="text-gray-400 hover:text-white transition-colors">Music</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">My Account</h3>
            <ul className="space-y-2">
              <li><Link href="/profile"><a className="text-gray-400 hover:text-white transition-colors">Profile</a></Link></li>
              <li><Link href="/profile"><a className="text-gray-400 hover:text-white transition-colors">My Collections</a></Link></li>
              <li><Link href="/profile"><a className="text-gray-400 hover:text-white transition-colors">Favorites</a></Link></li>
              <li><Link href="/create"><a className="text-gray-400 hover:text-white transition-colors">Create</a></Link></li>
              <li><Link href="/profile"><a className="text-gray-400 hover:text-white transition-colors">Settings</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Platform Status</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Newsletter</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© 2025 VeCollab. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
