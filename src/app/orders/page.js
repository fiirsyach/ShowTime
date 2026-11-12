'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaTicketAlt, 
  FaCalendar, 
  FaEye, 
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChevronRight,
  FaSearch
} from 'react-icons/fa';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import CustomerLayout from '../../../components/CustomerLayout';
import { useSiteSettings } from '../../../context/SiteSettingsContext';

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

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const { formatMoney, language } = useSiteSettings();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoadingOrders(true);
      const response = await api.get(`/customer/orders?status=${filter}&page=${page}&limit=10`);
      if (response.data.success) {
        setOrders(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat riwayat pesanan');
    } finally {
      setLoadingOrders(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return undefined;
    const timeout = setTimeout(() => { void fetchOrders(); }, 0);
    return () => clearTimeout(timeout);
  }, [user, loading, filter, router, fetchOrders]);

  const getStatusBadge = (status) => {
    const map = {
      paid: { color: 'text-green-400 bg-green-400/10', icon: FaCheckCircle, label: 'Paid' },
      pending: { color: 'text-yellow-400 bg-yellow-400/10', icon: FaClock, label: 'Pending' },
      cancelled: { color: 'text-red-400 bg-red-400/10', icon: FaTimesCircle, label: 'Cancelled' },
      refunded: { color: 'text-blue-400 bg-blue-400/10', icon: FaCheckCircle, label: 'Refunded' },
      expired: { color: 'text-gray-400 bg-gray-400/10', icon: FaTimesCircle, label: 'Expired' }
    };
    return map[status] || map.pending;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filter === 'all' || order.status === filter;
    const query = searchTerm.trim().toLowerCase();
    const matchesQuery = !query || order.orderNumber?.toLowerCase().includes(query) || order.concert?.name?.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  if (loading || loadingOrders) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-white/60">Loading orders...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-2">Order History</h1>
            <p className="text-white/60">All your ticket orders in one place</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'paid', 'pending', 'cancelled', 'refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm transition-all capitalize ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All Orders' : status}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="w-full px-4 py-2 pl-11 glass rounded-full text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={order.id} className="glass p-6 rounded-2xl hover:border-primary/30 transition-all">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold truncate">{order.concert?.name || 'Concert'}</h3>
                          <p className="text-sm text-white/60">Order #{order.orderNumber || order.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-primary w-3 h-3" />
                          <span>{order.concert?.date ? format(new Date(order.concert.date), 'd MMM yyyy', { locale: language === 'en' ? enUS : id }) : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-secondary w-3 h-3" />
                          <span>{order.orderTickets?.length || 0} tickets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gradient">{formatMoney(order.totalAmount || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/40">
                        <span>Payment: {order.paymentMethod || '-'}</span>
                        <span>•</span>
                        <span>Status: {order.orderPayment?.status || 'pending'}</span>
                        <span>•</span>
                        <span>{order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy HH:mm', { locale: language === 'en' ? enUS : id }) : '-'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <FaEye className="w-4 h-4" />
                        Detail
                      </Link>
                      {order.status === 'paid' && (
                        <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                          <FaDownload className="w-4 h-4" />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center">
            <FaTicketAlt className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Orders Found</h3>
            <p className="text-white/60">You haven&apos;t placed any orders yet.</p>
            <Link href="/concerts" className="btn-primary inline-block mt-4">
              Browse Concerts
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setPagination({ ...pagination, page });
                  fetchOrders(page);
                }}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  page === pagination.page
                    ? 'bg-primary text-white'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}