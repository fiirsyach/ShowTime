'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome,
  FaSearch, 
  FaUser, 
  FaTicketAlt,
  FaBars, 
  FaTimes,
  FaHeart,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaChevronDown
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar-profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const dashboardPath = user?.role === 'organizer'
    ? '/organizer/dashboard'
    : user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'super_admin'
        ? '/super-admin/dashboard'
        : '/dashboard';

  const profileMenu = user?.role === 'customer'
    ? [
        { href: dashboardPath, icon: FaHome, label: 'Dashboard' },
        { href: '/my-tickets', icon: FaTicketAlt, label: 'My Tickets' },
        { href: '/wishlist', icon: FaHeart, label: 'Wishlist' },
        { href: '/orders', icon: FaCalendarAlt, label: 'Order History' },
        { href: '/profile', icon: FaUser, label: 'Profile' },
        { href: '/settings', icon: FaCog, label: 'Settings' },
      ]
    : [
        { href: dashboardPath, icon: FaHome, label: 'Dashboard' },
        { href: '/profile', icon: FaUser, label: 'Profile' },
        { href: '/settings', icon: FaCog, label: 'Settings' },
      ];

  const navLinks = [
    { href: '/concerts', section: 'concerts', label: 'Concert' },
    { href: '/festival', section: 'festival', label: 'Festival' },
    { href: '/promo', section: 'promo', label: 'Promo' },
  ];
  const isLandingPage = pathname === '/';
  const getNavHref = (link) => link.section
    ? isLandingPage ? `#${link.section}` : `/#${link.section}`
    : link.href;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-dark py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={isLandingPage ? '#top' : '/'} className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-gradient"
          >
            ShowTime
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={getNavHref(link)}
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
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <FaSearch className="w-5 h-5" />
          </button>

          {authLoading ? null : user ? (
            <>
              <NotificationBell />
              <div className="relative navbar-profile-dropdown">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || <FaUser />}
                  </div>
                  <FaChevronDown className={`w-3 h-3 text-white/60 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-dark rounded-xl overflow-hidden shadow-xl border border-white/10">
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
                          type="button"
                          onClick={logout}
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
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                Login
              </Link>
              <Link href="/register" className="btn-primary px-6 py-2">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={false}
        animate={{
          height: isSearchOpen ? 'auto' : 0,
          opacity: isSearchOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden px-4"
      >
        <div className="max-w-2xl mx-auto py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search concerts and venues..."
              className="w-full px-4 py-3 pl-12 bg-dark/50 backdrop-blur-lg border border-white/10 rounded-xl text-white placeholder-white/50 focus:border-primary focus:outline-none"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="lg:hidden overflow-hidden"
      >
        <div className="px-4 py-4 space-y-2">
          {!authLoading && user && (
            <div className="flex justify-end pb-2">
              <NotificationBell />
            </div>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={getNavHref(link)}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl transition-colors ${
                pathname === link.href
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!authLoading && (user ? (
            <>
              {profileMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </Link>
              ))}
              <button
                type="button"
                onClick={logout}
                className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <FaSignOutAlt className="w-4 h-4" />
                  Logout
                </span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-center px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors">
                Login
              </Link>
              <Link href="/register" className="block text-center btn-primary">
                Register
              </Link>
            </>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;