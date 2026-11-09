'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaTicketAlt, 
  FaCalendar, 
  FaHeart, 
  FaClock, 
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaArrowRight
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomerLayout from '../../../components/CustomerLayout';
import { getConcertPoster, getMediaUrl } from '../../../lib/media-url';

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

export default function CustomerDashboard() {
  const {
    user,
    loading: authLoading,
    wishlistConcertIds,
    wishlistBusyConcertIds,
    wishlistLoading,
    toggleWishlist,
  } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hanya redirect jika sudah selesai loading dan tidak ada user
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchDashboard();
    }
  }, [user, authLoading]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-white/60">Loading your dashboard...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // Jika tidak ada user, return null (redirect sudah terjadi di useEffect)
  if (!user) {
    return null;
  }

  const stats = dashboardData?.stats || {
    totalTickets: 0,
    upcomingEvents: 0,
    wishlist: 0,
    totalSpent: 0
  };

  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const recentOrders = dashboardData?.recentOrders || [];
  const publishedConcerts = dashboardData?.publishedConcerts || [];

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Welcome back, <span className="text-gradient">{user?.name}</span>!
            </h1>
            <p className="text-lg text-white/60">
              Discover new concerts, manage your tickets, and never miss your favorite artists.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/my-tickets" className="glass p-6 rounded-2xl hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaTicketAlt className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTickets}</p>
                <p className="text-sm text-white/60">Tickets</p>
              </div>
            </div>
          </Link>

          <Link href="/orders" className="glass p-6 rounded-2xl hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaCalendar className="text-secondary text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                <p className="text-sm text-white/60">Upcoming</p>
              </div>
            </div>
          </Link>

          <Link href="/wishlist" className="glass p-6 rounded-2xl hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaHeart className="text-red-500 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.wishlist}</p>
                <p className="text-sm text-white/60">Wishlist</p>
              </div>
            </div>
          </Link>

          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <FaMoneyBillWave className="text-green-500 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient">Rp {stats.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-white/60">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Published Concerts */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">🎵 Featured Concerts</h2>
            <p className="text-sm text-white/60">Discover amazing concerts near you</p>
          </div>
          <Link href="/concerts" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 text-sm">
            View All
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {publishedConcerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedConcerts.slice(0, 6).map((concert) => {
              const isWishlisted = wishlistConcertIds.includes(Number(concert.id));
              const isWishlistBusy = wishlistBusyConcertIds.includes(Number(concert.id));
              const poster = getConcertPoster(concert.concertGalleries) || getMediaUrl(concert.thumbnail);

              return (
                <div key={concert.id} className="relative">
                  <Link
                    href={`/concerts/${concert.id}`}
                    className="glass block rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={`Poster ${concert.name}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl">🎵</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {concert.name}
                      </h3>
                      <p className="text-sm text-white/60">by {concert.organizer?.name || 'Organizer'}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
                        <FaCalendar className="text-primary w-3 h-3" />
                        <span>{concert.date ? format(new Date(concert.date), 'd MMM yyyy', { locale: id }) : '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
                        <FaMapMarkerAlt className="text-secondary w-3 h-3" />
                        <span>{concert.venue?.name || concert.venueName || '-'}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-lg font-bold text-gradient">
                          Rp {concert.minPrice?.toLocaleString() || 0}
                        </span>
                        <span className="text-xs text-green-400">
                          {concert.availableTickets || 0} left
                        </span>
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambahkan ke wishlist'}
                    aria-pressed={isWishlisted}
                    title={isWishlisted ? 'Hapus dari wishlist' : 'Tambahkan ke wishlist'}
                    disabled={authLoading || wishlistLoading || isWishlistBusy}
                    onClick={() => toggleWishlist(concert.id)}
                    className="absolute right-3 top-3 z-10 rounded-full glass p-2.5 transition-all duration-300 hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
                  >
                    <FaHeart className={`h-4 w-4 transition-colors duration-300 ${isWishlisted ? 'text-red-500' : 'text-white/60 hover:text-white'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center">
            <p className="text-white/40">No concerts available at the moment.</p>
          </div>
        )}
      </section>

      {/* Upcoming Events & Recent Orders */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">🎫 Your Tickets</h3>
              <Link href="/my-tickets" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1">
                View All
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((ticket) => (
                  <div key={ticket.id} className="flex items-center gap-4 p-3 glass rounded-xl hover:border-primary/30 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-2xl flex-shrink-0">
                      🎵
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ticket.concert?.name || 'Concert'}</p>
                      <p className="text-sm text-white/60 truncate">{ticket.concert?.venue?.name || '-'}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-primary">
                        {ticket.concert?.date ? format(new Date(ticket.concert.date), 'd MMM', { locale: id }) : '-'}
                      </p>
                      <p className="text-xs text-white/40">
                        {ticket.concert?.date ? format(new Date(ticket.concert.date), 'HH:mm', { locale: id }) : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-center py-4">No upcoming tickets</p>
            )}
          </div>

          {/* Recent Orders */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">📦 Recent Orders</h3>
              <Link href="/orders" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1">
                View All
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 glass rounded-xl">
                    <div>
                      <p className="font-medium">{order.concert?.name || 'Concert'}</p>
                      <p className="text-xs text-white/40">Order #{order.orderNumber || order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gradient">Rp {order.totalAmount?.toLocaleString() || 0}</p>
                      <p className="text-xs text-white/40">{order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy', { locale: id }) : '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}