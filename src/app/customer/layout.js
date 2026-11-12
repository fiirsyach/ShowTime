'use client';

import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { 
  FaHome, 
  FaTicketAlt, 
  FaHeart, 
  FaCalendar, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaSearch,
  FaChevronDown
} from 'react-icons/fa';
import NotificationBell from '../../../components/NotificationBell';

export default function CustomerLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/concerts', label: 'Concerts' },
    { href: '/festival', label: 'Festival' },
  ];

  const profileMenu = [
    { href: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/my-tickets', icon: FaTicketAlt, label: 'My Tickets' },
    { href: '/wishlist', icon: FaHeart, label: 'Wishlist' },
    { href: '/orders', icon: FaCalendar, label: 'Order History' },
    { href: '/profile', icon: FaUser, label: 'Profile' },
    { href: '/settings', icon: FaCog, label: 'Settings' },
  ];

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar - Sama dengan Landing Page */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-dark py-3' : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient">ShowTime</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-white/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <FaSearch className="w-5 h-5 text-white/60" />
            </button>
            <NotificationBell />

            {/* Profile Avatar dengan Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <FaChevronDown className={`w-3 h-3 text-white/60 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-dark rounded-xl overflow-hidden shadow-xl border border-white/10">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-white/40">{user.email}</p>
                  </div>
                  <div className="p-2">
                    {profileMenu.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === item.href
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-dark border-t border-white/10">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <div className="flex justify-end pb-2">
                <NotificationBell />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl transition-colors ${
                    pathname === link.href
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-white/10 text-white/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 pt-3 mt-2">
                {profileMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl transition-colors ${
                      pathname === item.href
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-white/10 text-white/70'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <FaSignOutAlt className="w-4 h-4" />
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}