'use client';

import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  FaHome, 
  FaTicketAlt, 
  FaHeart, 
  FaUser, 
  FaCog,
  FaSignOutAlt,
  FaCalendarAlt,
  FaPlus,
  FaGift,
  FaImage,
  FaMoneyBillWave,
  FaUniversity,
  FaUsers,
  FaCheckCircle,
  FaClipboardList,
  FaChartLine,
  FaShieldAlt,
  FaDatabase,
  FaBuilding,
  FaUserShield,
  FaMusic
} from 'react-icons/fa';

const SidebarItem = ({ href, icon: Icon, label, active, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-primary/20 text-primary' 
        : 'hover:bg-white/5 text-white/60 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const CustomerSidebar = ({ pathname, logout }) => {
  const items = [
    { href: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/my-tickets', icon: FaTicketAlt, label: 'My Tickets' },
    { href: '/wishlist', icon: FaHeart, label: 'Wishlist' },
    { href: '/orders', icon: FaClipboardList, label: 'Order History' },
    { href: '/profile', icon: FaUser, label: 'Profile' },
    { href: '/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <aside className="w-64 min-h-screen glass-dark border-r border-white/5 p-6 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ShowTime</h2>
        <p className="text-xs text-white/40 mt-1">Customer Dashboard</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <SidebarItem 
            key={item.href}
            {...item} 
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
        <div className="pt-4 mt-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

const OrganizerSidebar = ({ pathname, logout }) => {
  const items = [
    { href: '/organizer/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/organizer/concerts', icon: FaMusic, label: 'Manage Concerts' },
    { href: '/organizer/tickets', icon: FaTicketAlt, label: 'Ticket Management' },
    { href: '/organizer/seats', icon: FaUsers, label: 'Seat Layout' },
    { href: '/organizer/gallery', icon: FaImage, label: 'Gallery' },
    { href: '/organizer/promos', icon: FaGift, label: 'Promo' },
    { href: '/organizer/orders', icon: FaTicketAlt, label: 'Orders' },
    { href: '/organizer/revenue', icon: FaMoneyBillWave, label: 'Revenue' },
    { href: '/organizer/analytics', icon: FaChartLine, label: 'Analytics' },
    { href: '/organizer/dashboard?tab=profile', icon: FaUser, label: 'Profile' },
  ];

  return (
    <aside className="w-64 min-h-screen glass-dark border-r border-white/5 p-6 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ShowTime</h2>
        <p className="text-xs text-white/40 mt-1">Organizer Dashboard</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <SidebarItem 
            key={item.href}
            {...item} 
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
        <div className="pt-4 mt-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

const AdminSidebar = ({ pathname, logout }) => {
  const items = [
    { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/admin/concerts/pending', icon: FaCheckCircle, label: 'Concert Verification' },
    { href: '/admin/organizers', icon: FaUsers, label: 'Organizer Verification' },
    { href: '/admin/orders', icon: FaClipboardList, label: 'Orders' },
    { href: '/admin/payments', icon: FaMoneyBillWave, label: 'Payments' },
    { href: '/admin/refunds', icon: FaTicketAlt, label: 'Refunds' },
    { href: '/admin/reports', icon: FaChartLine, label: 'Reports' },
  ];

  return (
    <aside className="w-64 min-h-screen glass-dark border-r border-white/5 p-6 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ShowTime</h2>
        <p className="text-xs text-white/40 mt-1">Admin Dashboard</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <SidebarItem 
            key={item.href}
            {...item} 
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
        <div className="pt-4 mt-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

const SuperAdminSidebar = ({ pathname, logout }) => {
  const items = [
    { href: '/super-admin/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/super-admin/admins', icon: FaUserShield, label: 'Manage Admins' },
    { href: '/super-admin/users', icon: FaUsers, label: 'Manage Users' },
    { href: '/super-admin/organizers', icon: FaBuilding, label: 'Manage Organizers' },
    { href: '/super-admin/system', icon: FaCog, label: 'System Settings' },
    { href: '/super-admin/audit', icon: FaClipboardList, label: 'Audit Log' },
    { href: '/super-admin/reports', icon: FaChartLine, label: 'Reports' },
    { href: '/super-admin/backup', icon: FaDatabase, label: 'Database Backup' },
  ];

  return (
    <aside className="w-64 min-h-screen glass-dark border-r border-white/5 p-6 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ShowTime</h2>
        <p className="text-xs text-white/40 mt-1">Super Admin</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <SidebarItem 
            key={item.href}
            {...item} 
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
        <div className="pt-4 mt-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default function Layout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
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

  if (!user) {
    return null;
  }

  const renderSidebar = () => {
    switch (user.role) {
      case 'customer':
        return <CustomerSidebar pathname={pathname} logout={handleLogout} />;
      case 'organizer':
        return <OrganizerSidebar pathname={pathname} logout={handleLogout} />;
      case 'admin':
        return <AdminSidebar pathname={pathname} logout={handleLogout} />;
      case 'super_admin':
        return <SuperAdminSidebar pathname={pathname} logout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-dark">
      {renderSidebar()}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}