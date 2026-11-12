'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import VenueCategoryMap from '../../../../components/VenueCategoryMap';
import { 
  FaCalendar, 
  FaClock, 
  FaMapMarkerAlt, 
  FaTicketAlt, 
  FaHeart, 
  FaArrowLeft,
  FaSpinner,
  FaUsers,
  FaShare,
  FaBuilding,
  FaCity,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { format } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getConcertPoster } from '../../../../lib/media-url';
import { useSiteSettings } from '../../../../context/SiteSettingsContext';

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

export default function ConcertDetailPage() {
  const { id } = useParams();
  const { user, wishlistConcertIds, toggleWishlist: toggleConcertWishlist } = useAuth();
  const { formatMoney, language } = useSiteSettings();
  const router = useRouter();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedTicketQuantities, setSelectedTicketQuantities] = useState({});
  const [seatMapData, setSeatMapData] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const isWishlist = wishlistConcertIds.includes(Number(concert?.id));

  useEffect(() => {
    if (id) {
      fetchConcert();
      fetchSeats();
    }
  }, [id]);
  

  const fetchConcert = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching concert with ID:', id);
      const response = await api.get(`/concerts/${id}`);
      console.log('✅ Concert detail response:', response.data);
      
      if (response.data.success) {
        setConcert(response.data.data);
      } else {
        toast.error('Konser tidak ditemukan');
        router.push('/');
      }
    } catch (error) {
      console.error('❌ Error fetching concert:', error);
      if (error.response?.status === 404) {
        toast.error('Konser tidak ditemukan');
        router.push('/');
      } else {
        toast.error('Gagal memuat detail konser');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async () => {
  try {
    setLoadingSeats(true);
    console.log('Fetching seats for concert:', id);
    
    const response = await api.get(`/concerts/${id}/seats`);
    console.log('Seats response:', response.data);
    
    if (response.data.success) {
      const data = response.data.data;
      setSeatMapData(data);
      
      // Log untuk debugging
      console.log('📊 Seats data:', {
        concert: data.concert,
        totalAvailable: data.totalAvailable,
        seatsCount: data.allSeats?.length || 0
      });
      
    }
  } catch (error) {
    console.error('❌ Error fetching seats:', error);
    toast.error('Gagal memuat data kursi');
  } finally {
    setLoadingSeats(false);
  }
};

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    await toggleConcertWishlist(concert.id);
  };

  const handleBuyTicket = () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }
    const selectedCategories = Object.entries(selectedTicketQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([categoryId, quantity]) => `${categoryId}:${quantity}`);
    if (selectedCategories.length === 0) {
      toast.error('Pilih kategori tiket terlebih dahulu');
      return;
    }
    router.push(`/checkout?concert=${concert.id}&categories=${selectedCategories.join(',')}`);
  };

  const updateTicketQuantity = (ticketCategory, change) => {
    setSelectedTicketQuantities((current) => {
      const currentQuantity = Number(current[ticketCategory.id] || 0);
      const nextQuantity = currentQuantity + change;
      const totalSelected = Object.values(current).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
      if (nextQuantity < 0 || nextQuantity > Number(ticketCategory.available || 0) || (change > 0 && totalSelected >= 10)) return current;
      return { ...current, [ticketCategory.id]: nextQuantity };
    });
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }
    if (user.role !== 'customer') {
      toast.error('Review hanya tersedia untuk akun customer');
      return;
    }
    try {
      setSubmittingReview(true);
      await api.post('/customer/reviews', {
        concertId: concert.id,
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Review dikirim untuk moderasi');
      setReviewComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'EEEE, d MMMM yyyy', { locale: language === 'en' ? enUS : idLocale });
    } catch (error) {
      return '-';
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: { label: 'Draft', class: 'bg-gray-500/20 text-gray-400' },
      pending: { label: 'Pending', class: 'bg-yellow-500/20 text-yellow-400' },
      approved: { label: 'Approved', class: 'bg-blue-500/20 text-blue-400' },
      published: { label: 'Published', class: 'bg-green-500/20 text-green-400' },
      on_sale: { label: 'On Sale', class: 'bg-green-500/20 text-green-400' },
      sold_out: { label: 'Sold Out', class: 'bg-red-500/20 text-red-400' },
      finished: { label: 'Finished', class: 'bg-gray-500/20 text-gray-400' },
      cancelled: { label: 'Cancelled', class: 'bg-red-500/20 text-red-400' }
    };
    return map[status] || map.draft;
  };

  const ticketCategories = seatMapData?.ticketCategories || [];
  const totalSelectedTickets = Object.values(selectedTicketQuantities).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
  const ticketCategoryThemes = [
    { border: 'border-amber-300/70', bg: 'bg-amber-300/10', text: 'text-amber-200', swatch: 'bg-amber-300' },
    { border: 'border-rose-400/70', bg: 'bg-rose-400/10', text: 'text-rose-200', swatch: 'bg-rose-400' },
    { border: 'border-cyan-300/70', bg: 'bg-cyan-300/10', text: 'text-cyan-200', swatch: 'bg-cyan-300' },
    { border: 'border-emerald-300/70', bg: 'bg-emerald-300/10', text: 'text-emerald-200', swatch: 'bg-emerald-300' },
    { border: 'border-orange-300/70', bg: 'bg-orange-300/10', text: 'text-orange-200', swatch: 'bg-orange-300' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading concert details...</p>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold mb-4">Konser tidak ditemukan</h2>
          <p className="text-white/60 mb-4">Konser yang Anda cari tidak tersedia.</p>
          <Link href="/" className="btn-primary inline-block">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(concert.status);
  const concertPoster = getConcertPoster(concert.concertGalleries);

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="glass p-6 rounded-2xl">
              {concertPoster && (
                <Image
                  src={concertPoster}
                  alt={`Poster ${concert.name}`}
                  width={1200}
                  height={800}
                  unoptimized
                  className="mb-6 max-h-[32rem] w-full rounded-xl object-cover"
                />
              )}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                  {status.label}
                </span>
                {concert.isFlashSale && (
                  <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium">
                    ⚡ Flash Sale
                  </span>
                )}
                {concert.isFeatured && (
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    ⭐ Featured
                  </span>
                )}
                {concert.availableTickets > 0 ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    ✅ Tersedia
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                    ❌ Habis
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{concert.name}</h1>
              
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full glass transition-all ${isWishlist ? 'text-red-500' : 'text-white/60 hover:text-white'}`}
                >
                  <FaHeart className={`w-4 h-4 ${isWishlist ? 'fill-red-500' : ''}`} />
                </button>
                <button className="p-2 rounded-full glass text-white/60 hover:text-white transition-all">
                  <FaShare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs - Hanya About dan Seats */}
            <div className="flex gap-1 glass p-1 rounded-xl overflow-x-auto">
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  activeTab === 'about' 
                    ? 'bg-primary text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Tentang
              </button>
              <button
                onClick={() => setActiveTab('seats')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  activeTab === 'seats' 
                    ? 'bg-primary text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Pilih Kategori
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${activeTab === 'reviews' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                Review
              </button>
            </div>

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4">📋 Informasi Konser</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-white/80">
                      <FaCalendar className="text-primary" />
                      <div>
                        <p className="text-sm text-white/60">Tanggal</p>
                        <p className="font-medium">{concert.dateLabel || formatDate(concert.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                      <FaClock className="text-secondary" />
                      <div>
                        <p className="text-sm text-white/60">Waktu</p>
                        <p className="font-medium">{concert.time || '19:00'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white/80 col-span-2">
                      <FaMapMarkerAlt className="text-red-400" />
                      <div>
                        <p className="text-sm text-white/60">Lokasi</p>
                        <p className="font-medium">{concert.venueName || concert.venue?.name || 'Venue'}</p>
                        <p className="text-sm text-white/60">{concert.city || concert.venue?.city || ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-3">📝 Deskripsi</h3>
                  <p className="text-white/80 leading-relaxed">
                    {concert.description || 'Tidak ada deskripsi untuk konser ini.'}
                  </p>
                </div>

              </div>
            )}

            {/* Ticket Categories Tab */}
            {activeTab === 'seats' && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-5">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Venue guide</p>
                      <h3 className="mt-1 text-xl font-bold">Peta area venue</h3>
                    </div>
                    <p className="max-w-md text-sm text-white/55">Peta menunjukkan area kategori. Kursi tidak bernomor dan posisi duduk bebas.</p>
                  </div>

                  {loadingSeats ? (
                    <div className="flex items-center justify-center py-12">
                      <FaSpinner className="w-8 h-8 text-primary animate-spin" />
                      <span className="ml-3 text-white/60">Memuat peta venue...</span>
                    </div>
                  ) : (
                    <div className="h-[430px]">
                      <VenueCategoryMap
                        concert={concert}
                        venue={concert?.venue}
                        ticketCategories={ticketCategories}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">Kategori tiket</h3>
                      <p className="mt-1 text-sm text-white/55">Pilih kategori dan jumlah tiket, maksimal 10 tiket per pesanan.</p>
                    </div>
                    <span className="text-sm text-white/45">{totalSelectedTickets}/10</span>
                  </div>
                  {ticketCategories.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ticketCategories.map((ticketCategory, index) => {
                        const theme = ticketCategoryThemes[index % ticketCategoryThemes.length];
                        const quantity = Number(selectedTicketQuantities[ticketCategory.id] || 0);
                        return (
                          <div key={ticketCategory.id} className={`glass rounded-xl border p-4 ${theme.border}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`h-2.5 w-2.5 rounded-full ${theme.swatch}`} />
                                  <h4 className="truncate font-semibold">{ticketCategory.category}</h4>
                                </div>
                                <p className={`mt-2 text-lg font-bold ${theme.text}`}>{formatMoney(ticketCategory.price)}</p>
                                <p className="mt-1 text-xs text-white/45">Tersedia {ticketCategory.available} tiket</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2" aria-label={`Jumlah ${ticketCategory.category}`}>
                                <button type="button" onClick={() => updateTicketQuantity(ticketCategory, -1)} disabled={quantity === 0} className="h-9 w-9 rounded border border-white/15 text-lg disabled:opacity-35" aria-label={`Kurangi ${ticketCategory.category}`}>-</button>
                                <span className="w-5 text-center font-semibold tabular-nums">{quantity}</span>
                                <button type="button" onClick={() => updateTicketQuantity(ticketCategory, 1)} disabled={quantity >= Number(ticketCategory.available) || totalSelectedTickets >= 10} className="h-9 w-9 rounded border border-white/15 text-lg disabled:opacity-35" aria-label={`Tambah ${ticketCategory.category}`}>+</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass rounded-xl p-6 text-center text-sm text-white/55">Kategori tiket belum tersedia.</div>
                  )}
                </div>

                <button onClick={handleBuyTicket} disabled={totalSelectedTickets === 0} className="btn-primary mt-1 w-full justify-center py-4 text-lg disabled:cursor-not-allowed disabled:opacity-45">
                  <FaTicketAlt className="h-5 w-5" />
                  Lanjutkan ({totalSelectedTickets} tiket)
                </button>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-5">
                {user?.role === 'customer' && (
                  <form onSubmit={submitReview} className="glass space-y-4 rounded-xl p-6">
                    <h3 className="text-lg font-semibold">Tulis review</h3>
                    <label className="block text-sm text-white/70">Rating
                      <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="input-field mt-2">
                        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                      </select>
                    </label>
                    <label className="block text-sm text-white/70">Komentar
                      <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} className="input-field mt-2 min-h-28" maxLength={3000} required />
                    </label>
                    <button disabled={submittingReview} className="btn-primary" type="submit">{submittingReview ? 'Mengirim...' : 'Kirim review'}</button>
                    <p className="text-xs text-white/40">Review tersedia setelah tiket digunakan dan akan ditampilkan setelah moderasi.</p>
                  </form>
                )}
                {(concert.concertReviews || []).length ? concert.concertReviews.map((review) => (
                  <article key={review.id} className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{review.reviewer?.name || 'Customer'}</p>
                      <p className="text-yellow-300">{'★'.repeat(review.rating)}<span className="text-white/20">{'★'.repeat(5 - review.rating)}</span></p>
                    </div>
                    {review.title && <h4 className="mt-2 font-medium">{review.title}</h4>}
                    <p className="mt-2 text-sm leading-6 text-white/70">{review.comment}</p>
                  </article>
                )) : <div className="glass rounded-xl p-8 text-center text-white/50">Belum ada review yang dipublikasikan.</div>}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass p-6 rounded-2xl sticky top-24">
              <h3 className="text-xl font-bold mb-4">🎫 Info Tiket</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Harga Mulai</span>
                  <span className="font-bold text-gradient">{formatMoney(concert.minPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tiket Tersedia</span>
                  <span className="font-bold text-green-400">{concert.availableTickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tiket Terjual</span>
                  <span className="font-bold text-white/80">{concert.soldTickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Kapasitas</span>
                  <span className="font-bold text-white/80">{concert.totalTickets || 0}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <FaUsers className="text-primary" />
                  <span>{Math.round(((concert.soldTickets || 0) / (concert.totalTickets || 1)) * 100)}% terjual</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${Math.round(((concert.soldTickets || 0) / (concert.totalTickets || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('seats')}
                className="btn-primary w-full mt-4"
              >
                <FaTicketAlt className="w-4 h-4" />
                Pesan Tiket
              </button>
            </div>

            {concert.venue && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4">📍 Lokasi</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{concert.venue.name}</p>
                  <p className="text-white/60">{concert.venue.address}</p>
                  <p className="text-white/60">{concert.venue.city}</p>
                  <button className="text-primary hover:text-primary/80 transition-colors text-sm">
                    Lihat di Google Maps →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}