'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaTicketAlt, 
  FaCalendar, 
  FaEye, 
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import Layout from '../../../../components/Layout';

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
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return undefined;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return undefined;
    }
    if (!user) return undefined;

    let cancelled = false;
    const loadOrders = async () => {
      try {
        const response = await api.get('/organizer/orders');
        if (!cancelled && response.data.success) setOrders(response.data.data);
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching orders:', error);
          toast.error('Gagal memuat riwayat pesanan');
        }
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  const getStatusBadge = (status) => {
    const map = {
      paid: { color: 'text-green-400 bg-green-400/10', icon: FaCheckCircle, label: 'Paid' },
      pending: { color: 'text-yellow-400 bg-yellow-400/10', icon: FaClock, label: 'Pending' },
      cancelled: { color: 'text-red-400 bg-red-400/10', icon: FaTimesCircle, label: 'Cancelled' },
      expired: { color: 'text-red-400 bg-red-400/10', icon: FaTimesCircle, label: 'Expired' },
      refunded: { color: 'text-blue-400 bg-blue-400/10', icon: FaCheckCircle, label: 'Refunded' }
    };
    return map[status] || { color: 'text-white/50 bg-white/10', icon: FaClock, label: status || 'Unknown' };
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const openOrderDetail = async (orderId) => {
    try {
      setSelectedOrder(null);
      setLoadingDetail(true);
      const response = await api.get(`/organizer/orders/${orderId}`);
      if (response.data.success) setSelectedOrder(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail pesanan');
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading || loadingOrders) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-white/60">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      {/* Header */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-2">Orders</h1>
            <p className="text-white/60">Pesanan tiket untuk konser yang Anda kelola</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'paid', 'pending', 'cancelled', 'expired', 'refunded'].map((status) => (
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

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={order.id} className="glass p-6 rounded-2xl hover:border-primary/30 transition-all">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold">{order.concert?.name || 'Concert'}</h3>
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
                          <span>{order.concert?.date ? format(new Date(order.concert.date), 'd MMM yyyy', { locale: id }) : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-secondary w-3 h-3" />
                          <span>{order.orderTickets?.length || 0} tickets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gradient">Rp {order.totalAmount?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/40">
                        <span>Gateway: {order.paymentMethod || '-'}</span>
                        <span>Payment status: {order.orderPayment?.status || 'not created'}</span>
                        <span>•</span>
                        <span>{order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy HH:mm', { locale: id }) : '-'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openOrderDetail(order.id)}
                        className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <FaEye className="w-4 h-4" />
                        Detail
                      </button>
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
            <p className="text-white/60">Belum ada pesanan untuk konser Anda.</p>
            <Link href="/organizer/concerts" className="btn-primary inline-block mt-4">
              Manage Concerts
            </Link>
          </div>
        )}
      </div>

      {(loadingDetail || selectedOrder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => !loadingDetail && setSelectedOrder(null)}>
          <section className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6" onClick={(event) => event.stopPropagation()}>
            {loadingDetail ? (
              <div className="flex justify-center py-12"><FaSpinner className="h-10 w-10 animate-spin text-primary" /></div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedOrder.concert?.name || 'Order detail'}</h2>
                    <p className="mt-1 text-sm text-white/50">Order #{selectedOrder.orderNumber}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="rounded-lg px-3 py-1 text-white/60 hover:bg-white/10">Tutup</button>
                </div>
                <div className="grid gap-3 rounded-xl bg-white/5 p-4 text-sm sm:grid-cols-2">
                  <p>Customer: <span className="text-white/70">{selectedOrder.user?.name || selectedOrder.customerName || '-'}</span></p>
                  <p>Email: <span className="text-white/70">{selectedOrder.user?.email || selectedOrder.customerEmail || '-'}</span></p>
                  <p>Order status: <span className="text-white/70 capitalize">{selectedOrder.status}</span></p>
                  <p>Payment status: <span className="text-white/70 capitalize">{selectedOrder.orderPayment?.status || 'not created'}</span></p>
                  <p>Gateway: <span className="text-white/70">{selectedOrder.paymentMethod || '-'}</span></p>
                  <p>Total: <span className="text-white/70">Rp {Number(selectedOrder.totalAmount || 0).toLocaleString('id-ID')}</span></p>
                </div>
                <h3 className="mb-3 mt-6 font-semibold">Tiket dalam pesanan</h3>
                <div className="space-y-2">
                  {(selectedOrder.orderTickets || []).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3 text-sm">
                      <span>{ticket.category || 'Ticket'} · {ticket.ticketNumber}</span>
                      <span className="capitalize text-white/60">{ticket.status}</span>
                    </div>
                  ))}
                  {!selectedOrder.orderTickets?.length && <p className="text-sm text-white/50">Tidak ada tiket pada pesanan ini.</p>}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}