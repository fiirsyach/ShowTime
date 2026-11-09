'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaTicketAlt, 
  FaMusic,
  FaMoneyBillWave,
  FaChartLine,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaSpinner,
  FaUsers,
  FaGift,
  FaImage,
  FaStar,
  FaCalendar,
  FaEye,
  FaShoppingCart
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function AnalyticsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role === 'organizer') {
      fetchAnalytics();
    }
  }, [user, loading, router, period]);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await api.get('/organizer/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/5 p-6 z-50 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ConcertHub</h2>
        <p className="text-xs text-white/40 mt-1">Organizer Dashboard</p>
        <p className="text-xs text-secondary mt-1">🏢 {user?.name}</p>
      </div>
      <nav className="space-y-1">
        <Link href="/organizer/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaHome className="w-5 h-5" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link href="/organizer/concerts" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaMusic className="w-5 h-5" />
          <span className="text-sm font-medium">Manage Concerts</span>
        </Link>
        <Link href="/organizer/tickets" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaTicketAlt className="w-5 h-5" />
          <span className="text-sm font-medium">Ticket Management</span>
        </Link>
        <Link href="/organizer/seats" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaUsers className="w-5 h-5" />
          <span className="text-sm font-medium">Seat Layout</span>
        </Link>
        <Link href="/organizer/gallery" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaImage className="w-5 h-5" />
          <span className="text-sm font-medium">Gallery</span>
        </Link>
        <Link href="/organizer/promos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaGift className="w-5 h-5" />
          <span className="text-sm font-medium">Promo</span>
        </Link>
        <Link href="/organizer/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaTicketAlt className="w-5 h-5" />
          <span className="text-sm font-medium">Orders</span>
        </Link>
        <Link href="/organizer/revenue" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaMoneyBillWave className="w-5 h-5" />
          <span className="text-sm font-medium">Revenue</span>
        </Link>
        <Link href="/organizer/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 text-secondary">
          <FaChartLine className="w-5 h-5" />
          <span className="text-sm font-medium">Analytics</span>
        </Link>
        <Link href="/organizer/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaUser className="w-5 h-5" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
        <div className="pt-4 mt-4 border-t border-white/5">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all">
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );

  if (loading || loadingAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-secondary animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  const maxSales = analytics?.dailySales?.reduce((max, item) => Math.max(max, item.sales), 1) || 1;

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-white/60 mt-1">Statistik penjualan dan performa konser</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-field py-2 text-sm w-32"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Tickets Sold</p>
                  <p className="text-2xl font-bold mt-1">{analytics?.totalTicketsSold?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <FaTicketAlt className="text-primary text-xl" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-gradient mt-1">Rp {analytics?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FaMoneyBillWave className="text-green-500 text-xl" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-400">{analytics?.averageRating || 0} ★</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <FaStar className="text-yellow-500 text-xl" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold mt-1 text-blue-400">{analytics?.conversionRate || 0}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FaShoppingCart className="text-blue-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Sales Chart */}
          <div className="glass p-6 rounded-2xl mb-8">
            <h3 className="text-xl font-bold mb-6">Daily Ticket Sales</h3>
            <div className="h-48 flex items-end gap-3">
              {analytics?.dailySales?.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(item.sales / maxSales) * 100}%` }}
                  />
                  <span className="text-xs text-white/40">{new Date(item.date).getDate()}</span>
                  <span className="text-xs text-white/60">{item.sales}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">Tickets by Category</h3>
              <div className="space-y-4">
                {analytics?.ticketsByCategory?.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{item.category}</span>
                      <span className="text-white/80">{item.sold} tickets</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${(item.sold / (analytics?.totalTicketsSold || 1)) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-1">Rp {item.revenue?.toLocaleString() || 0}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">Top Performing Concerts</h3>
              <div className="space-y-4">
                {analytics?.topConcerts?.map((concert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 glass rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{concert.name}</p>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{concert.tickets} tickets</span>
                        <span>•</span>
                        <span className="text-yellow-400">★ {concert.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gradient">Rp {concert.revenue?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <FaEye className="text-primary text-xl" />
                <div>
                  <p className="text-white/60 text-sm">Total Views</p>
                  <p className="font-bold">{analytics?.views?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <FaUsers className="text-secondary text-xl" />
                <div>
                  <p className="text-white/60 text-sm">Total Concerts</p>
                  <p className="font-bold">{analytics?.totalConcerts || 0}</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <FaCalendar className="text-green-500 text-xl" />
                <div>
                  <p className="text-white/60 text-sm">Upcoming</p>
                  <p className="font-bold text-green-400">{analytics?.upcomingConcerts || 0} concerts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}