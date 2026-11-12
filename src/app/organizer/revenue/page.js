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
  FaDownload,
  FaCalendar,
  FaArrowDown,
  FaArrowUp
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
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

export default function RevenuePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role === 'organizer') {
      fetchRevenue();
    }
  }, [user, loading, router, period]);

  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);
      const response = await api.get('/organizer/revenue');
      if (response.data.success) {
        setRevenueData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast.error('Gagal memuat data revenue');
    } finally {
      setLoadingRevenue(false);
    }
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/5 p-6 z-50 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ShowTime</h2>
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
        <Link href="/organizer/revenue" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 text-secondary">
          <FaMoneyBillWave className="w-5 h-5" />
          <span className="text-sm font-medium">Revenue</span>
        </Link>
        <Link href="/organizer/withdraw" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaMoneyBillWave className="w-5 h-5" />
          <span className="text-sm font-medium">Withdrawals</span>
        </Link>
        <Link href="/organizer/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
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

  if (loading || loadingRevenue) {
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

  const maxRevenue = revenueData?.monthly?.reduce((max, item) => Math.max(max, item.total), 0) || 1;

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Revenue</h1>
              <p className="text-white/60 mt-1">Lihat pendapatan dari penjualan tiket</p>
            </div>
            <div className="flex gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input-field py-2 text-sm w-32"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button className="glass px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                <FaDownload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass p-6 rounded-2xl">
              <p className="text-white/60 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-gradient">Rp {revenueData?.total?.toLocaleString() || 0}</p>
              <p className="text-xs text-white/40 mt-1">All time</p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <p className="text-white/60 text-sm">This Month</p>
              <p className="text-3xl font-bold text-gradient">Rp {revenueData?.thisMonth?.toLocaleString() || 0}</p>
              <p className="text-xs text-white/40 mt-1">{format(new Date(), 'MMMM yyyy', { locale: id })}</p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <p className="text-white/60 text-sm">Growth</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-green-400">+{revenueData?.growth || 0}%</p>
                {revenueData?.growth > 0 ? (
                  <FaArrowUp className="text-green-400 text-xl" />
                ) : (
                  <FaArrowDown className="text-red-400 text-xl" />
                )}
              </div>
              <p className="text-xs text-white/40 mt-1">Compared to last month</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="glass p-6 rounded-2xl mb-8">
            <h3 className="text-xl font-bold mb-6">Revenue Chart</h3>
            <div className="h-64 flex items-end gap-4">
              {revenueData?.monthly?.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(item.total / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-white/40">{item.month}</span>
                  <span className="text-xs text-white/60">Rp {(item.total / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Concert */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Revenue by Concert</h3>
            <div className="space-y-4">
              {revenueData?.byConcert?.map((concert, index) => (
                <div key={index} className="flex items-center justify-between p-4 glass rounded-xl">
                  <div>
                    <p className="font-medium">{concert.name}</p>
                    <p className="text-xs text-white/40">{concert.tickets} tickets sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gradient">Rp {concert.revenue.toLocaleString()}</p>
                    <p className="text-xs text-white/40">
                      {revenueData?.total ? Math.round((concert.revenue / revenueData.total) * 100) : 0}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}