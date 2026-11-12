import Link from 'next/link';
import { FaTwitter, FaInstagram, FaYoutube, FaSpotify, FaApple } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark/50 backdrop-blur-lg border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-4">ShowTime</h3>
            <p className="text-white/60 text-sm">
              Your premier destination for concert tickets and live events.
              Experience the best music events with ease.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-white/40 hover:text-primary transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-primary transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-primary transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-primary transition-colors">
                <FaSpotify className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-primary transition-colors">
                <FaApple className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/concerts" className="text-white/60 hover:text-primary transition-colors">Concerts</Link></li>
              <li><Link href="/festival" className="text-white/60 hover:text-primary transition-colors">Festivals</Link></li>
              <li><Link href="/news" className="text-white/60 hover:text-primary transition-colors">News</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="text-white/60 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/faq" className="text-white/60 hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-white/60 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="text-white/60 hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h4 className="font-semibold mb-4">Get the App</h4>
            <p className="text-white/60 text-sm mb-4">
              Download our app for the best experience.
            </p>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 glass rounded-lg text-sm flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors">
                <FaApple className="w-5 h-5" />
                <span>App Store</span>
              </button>
              <button className="w-full px-4 py-2 glass rounded-lg text-sm flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors">
                <span>Play Store</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>&copy; 2025 ShowTime. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;