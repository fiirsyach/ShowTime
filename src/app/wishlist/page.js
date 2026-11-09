'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHeart, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaTrash,
  FaSpinner,
  FaClock,
  FaArrowRight,
  FaMusic
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
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

export default function WishlistPage() {
  const { user, loading, removeWishlist } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    let isActive = true;
    const loadWishlist = async () => {
      try {
        const response = await api.get('/customer/wishlist');
        if (isActive && response.data.success) {
          setWishlist(response.data.data);
        }
      } catch (error) {
        if (isActive) {
          console.error('Error fetching wishlist:', error);
          toast.error('Gagal memuat wishlist');
        }
      } finally {
        if (isActive) setLoadingWishlist(false);
      }
    };

    loadWishlist();
    return () => {
      isActive = false;
    };
  }, [user, loading, router]);

  const removeFromWishlist = async (concertId) => {
    const removed = await removeWishlist(concertId);
    if (removed) {
      setWishlist((current) => current.filter((item) => Number(item.concertId) !== Number(concertId)));
    }
  };

  const formatDate = (value, pattern) => {
    if (!value || !Number.isFinite(new Date(value).getTime())) return 'Tanggal belum tersedia';
    return format(new Date(value), pattern, { locale: id });
  };

  const formatPrice = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  if (loading || loadingWishlist) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-white/60">Loading wishlist...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!user) return null;

  return (
    <CustomerLayout>
      <section className="relative overflow-hidden border-b border-white/10 pt-32 pb-12">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-secondary/10 blur-[90px]" />
        <div className="container-custom relative">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                <FaHeart className="text-red-400" /> Koleksi favorit
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Wishlist</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                Konser yang kamu simpan, siap ditemukan kembali kapan saja.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FaHeart />
              </span>
              <div>
                <p className="text-2xl font-bold leading-none">{wishlist.length}</p>
                <p className="mt-1 text-xs text-white/50">konser tersimpan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-10 sm:py-12">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {wishlist.map((item) => {
              const concert = item.concert;
              const poster = getConcertPoster(concert?.concertGalleries) || getMediaUrl(concert?.thumbnail || concert?.banner);
              const availableTickets = Number(concert?.availableTickets);
              const isSoldOut = Number.isFinite(availableTickets) && availableTickets <= 0;
              const almostSoldOut = Number.isFinite(availableTickets) && availableTickets > 0 && availableTickets < 50;
              const venueName = concert?.venue?.name || concert?.venueName || 'Lokasi belum diatur';
              const city = concert?.venue?.city || concert?.city;

              return (
                <article key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#171e30] shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-indigo-500/25 via-slate-800 to-orange-500/20">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={`Poster ${concert?.name || 'konser'}`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => { event.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaMusic className="h-14 w-14 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                    {concert?.genre || 'Konser'}
                  </span>
                  <button
                    type="button"
                    aria-label={`Hapus ${concert?.name || 'konser'} dari wishlist`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(item.concertId);
                    }}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/80 backdrop-blur transition hover:border-red-400/50 hover:bg-red-500/80 hover:text-white"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                  {(almostSoldOut || isSoldOut) && (
                    <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${isSoldOut ? 'bg-red-500/90' : 'bg-amber-400/90 text-amber-950'}`}>
                      {isSoldOut ? 'Tiket habis' : 'Hampir habis'}
                    </span>
                  )}
                </div>
                
                <div className="p-5">
                  <Link href={`/concerts/${concert?.slug || concert?.id}`} className="block">
                    <h2 className="line-clamp-1 text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
                      {concert?.name || 'Konser'}
                    </h2>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-sm text-white/50">
                    {concert?.artist?.name || concert?.artistName || concert?.organizer?.name || 'Lineup segera diumumkan'}
                  </p>
                  
                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <FaCalendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div>
                        <p className="text-white/85">{formatDate(concert?.date, 'EEE, d MMM yyyy')}</p>
                        <p className="mt-0.5 text-xs text-white/40">{concert?.time ? concert.time.slice(0, 5) : 'Waktu belum ditentukan'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <FaMapMarkerAlt className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                      <div className="min-w-0">
                        <p className="truncate text-white/85">{venueName}</p>
                        <p className="mt-0.5 truncate text-xs text-white/40">{city || 'Kota belum diatur'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-white/40">Mulai dari</p>
                      <p className="mt-1 truncate text-lg font-bold text-white">{formatPrice(concert?.minPrice)}</p>
                    </div>
                    <Link 
                      href={`/concerts/${concert?.slug || concert?.id}`}
                      className={`inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isSoldOut ? 'bg-white/10 text-white/60 hover:bg-white/15' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/85'}`}
                    >
                      {isSoldOut ? 'Lihat konser' : 'Lihat tiket'}
                      <FaArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/35">
                    <FaClock className="h-3 w-3" />
                    Disimpan {formatDate(item.createdAt, 'd MMM yyyy')}
                  </p>
                  </div>
                  </article>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-6 py-16 text-center sm:px-12">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
              <FaHeart className="h-7 w-7" />
            </span>
            <h2 className="mt-6 text-2xl font-bold">Belum ada konser tersimpan</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">
              Tandai konser yang kamu suka dengan ikon hati. Kami simpan di sini supaya mudah ditemukan lagi.
            </p>
            <Link href="/concerts" className="btn-primary mt-7">
              Jelajahi konser <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </section>
    </CustomerLayout>
  );
}