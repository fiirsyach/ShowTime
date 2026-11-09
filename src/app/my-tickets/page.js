'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaTicketAlt, 
  FaDownload, 
  FaEye, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaSpinner,
  FaQrcode,
  FaChevronRight
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import CustomerLayout from '../../../components/CustomerLayout';

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

export default function MyTicketsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketQrs, setTicketQrs] = useState({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchTickets();
    }
  }, [user, loading]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await api.get('/customer/tickets');
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Gagal memuat tiket');
    } finally {
      setLoadingTickets(false);
    }
  };

  const showTicketQr = async (ticketId, event) => {
    event.stopPropagation();
    try {
      const response = await api.get(`/customer/tickets/${ticketId}/qr`);
      setTicketQrs((current) => ({ ...current, [ticketId]: response.data.data.qrCode }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'QR belum tersedia');
    }
  };

  const downloadTicketQr = async (ticket, event) => {
    event.stopPropagation();
    try {
      const qrCode = ticketQrs[ticket.id] || ticket.qrCode ||
        (await api.get(`/customer/tickets/${ticket.id}/qr`)).data.data.qrCode;
      setTicketQrs((current) => ({ ...current, [ticket.id]: qrCode }));

      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `barcode-${ticket.ticketNumber || ticket.id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh barcode');
    }
  };

  const downloadTicketPdf = async (ticketId, event) => {
    event.stopPropagation();
    try {
      const response = await api.get(`/customer/tickets/${ticketId}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh tiket');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      active: { color: 'text-green-400 bg-green-400/10', label: 'Active' },
      used: { color: 'text-gray-400 bg-gray-400/10', label: 'Used' },
      refunded: { color: 'text-blue-400 bg-blue-400/10', label: 'Refunded' },
      cancelled: { color: 'text-red-400 bg-red-400/10', label: 'Cancelled' }
    };
    return map[status] || map.active;
  };

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  if (loading || loadingTickets) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-white/60">Loading your tickets...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!user) return null;

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
            <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
            <p className="text-white/60">All your concert tickets in one place</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'active', 'used', 'refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm transition-all capitalize ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'glass text-white/60 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All Tickets' : status}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const statusBadge = getStatusBadge(ticket.status);
              const seatLabel = ticket.seat
                ? `${ticket.seat.row}-${ticket.seat.number}`
                : `${ticket.category || 'Regular'}`;
              return (
                <div 
                  key={ticket.id} 
                  className="glass p-6 rounded-2xl hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* QR Code */}
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {ticketQrs[ticket.id] || ticket.qrCode
                        ? <Image src={ticketQrs[ticket.id] || ticket.qrCode} alt={`QR ${ticket.ticketNumber}`} width={64} height={64} unoptimized className="h-full w-full" />
                        : <FaQrcode className="w-10 h-10 text-gray-400" />}
                    </div>

                    {/* Ticket Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold truncate">
                            {ticket.concert?.name || 'Concert'}
                          </h3>
                          <p className="text-sm text-white/60">
                            by {ticket.concert?.artist?.name || 'Unknown Artist'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-primary w-3 h-3" />
                          <span>{ticket.concert?.date ? format(new Date(ticket.concert.date), 'd MMM yyyy', { locale: id }) : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-secondary w-3 h-3" />
                          <span>{ticket.concert?.time || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-red-400 w-3 h-3" />
                          <span className="truncate">{ticket.concert?.venue?.name || ticket.concert?.venueName || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-purple-400 w-3 h-3" />
                          <span>{ticket.seat ? `Seat ${seatLabel}` : seatLabel}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/40">
                        <span>Ticket: {ticket.ticketNumber || ticket.id}</span>
                        <span>•</span>
                        <span>Price: Rp {ticket.price?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link 
                        href={`/concerts/${ticket.concert?.id}`}
                        className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaEye className="w-4 h-4" />
                        Detail
                      </Link>
                      {ticket.order?.status === 'paid' && ['active', 'used'].includes(ticket.status) && (
                        <>
                          <button className="px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2" onClick={(e) => downloadTicketQr(ticket, e)} title="Unduh barcode PNG">
                            <FaDownload className="w-4 h-4" />
                            PNG
                          </button>
                          <button className="px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2" onClick={(e) => downloadTicketPdf(ticket.id, e)} title="Unduh e-ticket PDF">
                            <FaDownload className="w-4 h-4" />
                            PDF
                          </button>
                          <button className="px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors" onClick={(e) => showTicketQr(ticket.id, e)} title="Tampilkan barcode">
                            <FaQrcode className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {selectedTicket?.id === ticket.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/60">Ticket Number</p>
                          <p className="font-mono">{ticket.ticketNumber || ticket.id}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Order Number</p>
                          <p className="font-mono">{ticket.order?.orderNumber || ticket.orderId}</p>
                        </div>
                        <div>
                          <p className="text-white/60">{ticket.seat ? 'Seat / Kategori' : 'Kategori tiket'}</p>
                          <p>{ticket.seat ? `${seatLabel} (${ticket.category || 'Regular'})` : seatLabel}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Price</p>
                          <p className="font-bold text-gradient">Rp {ticket.price?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Payment Method</p>
                          <p>{ticket.order?.paymentMethod || '-'}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Purchased At</p>
                          <p>{ticket.createdAt ? format(new Date(ticket.createdAt), 'd MMM yyyy HH:mm', { locale: id }) : '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center">
            <FaTicketAlt className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Tickets Found</h3>
            <p className="text-white/60">You don't have any tickets in this category.</p>
            <Link href="/dashboard" className="btn-primary inline-block mt-4">
              Browse Concerts
            </Link>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}