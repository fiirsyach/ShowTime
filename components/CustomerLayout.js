'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaTicketAlt, 
  FaHeart, 
  FaCalendar, 
  FaUser, 
  FaSignOutAlt,
  FaSearch,
  FaChevronDown,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function CustomerLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const { t } = useSiteSettings();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileOpen && !e.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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

  const profileMenu = [
    { href: '/dashboard', icon: FaHome, label: t('Dashboard') },
    { href: '/my-tickets', icon: FaTicketAlt, label: t('My Tickets') },
    { href: '/wishlist', icon: FaHeart, label: t('Wishlist') },
    { href: '/orders', icon: FaCalendar, label: t('Order History') },
    { href: '/profile', icon: FaUser, label: t('Profile') },
  ];

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-dark py-3 border-b border-white/5' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-xl md:text-2xl font-bold text-gradient">ShowTime</span>
          </Link>

          {/* Search Bar - Full Width */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search concerts and venues...')}
                className="w-full px-4 py-2.5 pl-11 glass rounded-full text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-full text-xs font-medium transition-colors"
              >
                {t('Search')}
              </button>
            </div>
          </form>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
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
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto">
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
            className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6 text-white" />
            ) : (
              <FaBars className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-dark border-t border-white/10 max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="container mx-auto px-4 py-4 space-y-1">
              <div className="flex justify-end pb-2">
                <NotificationBell />
              </div>
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-4 py-2.5 pl-11 glass rounded-full text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none"
                  />
                </div>
              </form>

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
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}