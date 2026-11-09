// src/app/organizer/concerts/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCalendar, 
  FaMapMarkerAlt,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaQrcode
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

export default function OrganizerConcertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      fetchConcerts();
    }
  }, [user, loading, router]);

  const fetchConcerts = async () => {
    try {
      setLoadingConcerts(true);
      const response = await api.get('/organizer/concerts');
      if (response.data.success) {
        setConcerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast.error('Gagal memuat konser');
    } finally {
      setLoadingConcerts(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'published': { color: 'text-green-400 bg-green-400/10', label: 'Published' },
      'on_sale': { color: 'text-green-400 bg-green-400/10', label: 'On Sale' },
      'draft': { color: 'text-gray-400 bg-gray-400/10', label: 'Draft' },
      'pending': { color: 'text-yellow-400 bg-yellow-400/10', label: 'Pending' },
      'rejected': { color: 'text-red-400 bg-red-400/10', label: 'Rejected' },
      'approved': { color: 'text-blue-400 bg-blue-400/10', label: 'Approved' },
      'sold_out': { color: 'text-red-400 bg-red-400/10', label: 'Sold Out' },
      'finished': { color: 'text-gray-400 bg-gray-400/10', label: 'Finished' },
      'cancelled': { color: 'text-red-400 bg-red-400/10', label: 'Cancelled' }
    };
    return statusMap[status] || { color: 'text-white/40 bg-white/5', label: status };
  };

  const handleDeleteConcert = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini?')) return;
    try {
      await api.delete(`/organizer/concerts/${id}`);
      toast.success('Konser berhasil dihapus!');
      fetchConcerts();
    } catch (error) {
      console.error('Error deleting concert:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus konser');
    }
  };

  const handlePublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/publish`);
      if (response.data.success) {
        toast.success('Konser berhasil dipublikasikan!');
        fetchConcerts();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal mempublikasikan konser';
      if (error.response?.data?.message?.includes('already published')) {
        toast.info('Konser ini sudah dipublikasikan sebelumnya.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleSubmitConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/submit`);
      if (response.data.success) {
        toast.success('Konser dikirim untuk moderasi');
        fetchConcerts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim konser untuk moderasi');
    }
  };

  const handleUnpublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/unpublish`);
      if (response.data.success) {
        toast.success('Konser berhasil di-unpublish!');
        fetchConcerts();
      }
    } catch (error) {
      console.error('Error unpublishing concert:', error);
      toast.error(error.response?.data?.message || 'Gagal meng-unpublish konser');
    }
  };

  // Filter concerts
  const filteredConcerts = concerts.filter(concert => {
    const matchesSearch = concert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          concert.venueName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || concert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading || loadingConcerts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading concerts...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Concerts</h1>
            <p className="text-white/60 mt-1">Manage all your concerts</p>
          </div>
          <Link 
            href="/organizer/concerts/create"
            className="btn-primary text-sm py-2"
          >
            <FaPlus className="w-4 h-4" />
            Create Concert
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concerts..."
              className="w-full px-4 py-2 pl-11 glass rounded-full text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field py-2 text-sm w-40"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="on_sale">On Sale</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="sold_out">Sold Out</option>
              <option value="finished">Finished</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Concerts Grid */}
        {filteredConcerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcerts.map((concert) => {
              const statusBadge = getStatusBadge(concert.status);
              return (
                <div key={concert.id} className="glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all group">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <span className="text-6xl opacity-30">🎵</span>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    {concert.isFeatured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500/80 rounded-full text-xs font-medium">
                        ⭐ Featured
                      </div>
                    )}
                    {concert.isFlashSale && (
                      <div className="absolute top-3 left-20 px-2 py-1 bg-secondary/80 rounded-full text-xs font-medium">
                        ⚡ Flash Sale
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {concert.name}
                    </h3>
                    <p className="text-sm text-white/60">{concert.genre || 'General'}</p>
                    
                    <div className="space-y-1 mt-3 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-primary w-3 h-3" />
                        <span>{concert.date ? format(new Date(concert.date), 'd MMM yyyy', { locale: id }) : '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-secondary w-3 h-3" />
                        <span>{concert.venueName || concert.venue || '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <span className="text-lg font-bold text-gradient">
                        Rp {concert.minPrice?.toLocaleString() || 0}
                      </span>
                      <span className="text-xs text-white/40">
                        {concert.totalTickets || 0} tickets
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Link 
                        href={`/concerts/${concert.id}`}
                        className="flex-1 glass py-2 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <FaEye className="w-3 h-3" />
                        View
                      </Link>
                      <Link 
                        href={`/organizer/concerts/${concert.id}/edit`}
                        className="flex-1 glass py-2 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <FaEdit className="w-3 h-3 text-primary" />
                        Edit
                      </Link>
                      <Link
                        href={`/organizer/scanner?concertId=${concert.id}`}
                        className="flex-1 glass py-2 rounded-lg text-xs hover:bg-green-500/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <FaQrcode className="w-3 h-3 text-green-300" />
                        Check-in
                      </Link>
                      {(concert.status === 'draft' || concert.status === 'rejected') && (
                        <button 
                          onClick={() => handleSubmitConcert(concert.id)}
                          className="flex-1 glass py-2 rounded-lg text-xs hover:bg-green-500/10 transition-colors flex items-center justify-center gap-1"
                          title="Submit for approval"
                        >
                          <FaCheckCircle className="w-3 h-3 text-green-400" />
                          Submit
                        </button>
                      )}
                      {concert.status === 'approved' && (
                        <button onClick={() => handlePublishConcert(concert.id)} className="flex-1 glass py-2 rounded-lg text-xs hover:bg-green-500/10 transition-colors">Publish</button>
                      )}
                      {(concert.status === 'published' || concert.status === 'on_sale') && (
                        <button 
                          onClick={() => handleUnpublishConcert(concert.id)}
                          className="flex-1 glass py-2 rounded-lg text-xs hover:bg-yellow-500/10 transition-colors flex items-center justify-center gap-1"
                          title="Unpublish"
                        >
                          <FaTimesCircle className="w-3 h-3 text-yellow-400" />
                          Unpublish
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteConcert(concert.id)}
                        className="flex-1 glass py-2 rounded-lg text-xs hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1 text-red-400"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-bold mb-2">Belum Ada Konser</h3>
            <p className="text-white/60 mb-4">Buat konser pertama Anda sekarang!</p>
            <Link href="/organizer/concerts/create" className="btn-primary inline-block">
              <FaPlus className="w-4 h-4" />
              Create Concert
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}