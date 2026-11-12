'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSpinner, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';
import { openMidtransSnap } from '../../lib/midtrans';
import { useSiteSettings } from '../../../context/SiteSettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function CheckoutContent() {
  const { user, loading } = useAuth();
  const { currency, formatMoney, t } = useSiteSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const concertId = searchParams.get('concert');
  const categoryParam = searchParams.get('categories');

  const [concert, setConcert] = useState(null);
  const [selectedTicketCategories, setSelectedTicketCategories] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', nik: '' });
  const [loadingData, setLoadingData] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const requestedCategories = useMemo(() => {
    return String(categoryParam || '')
      .split(',')
      .map((value) => {
        const [id, quantity] = value.split(':').map(Number);
        return { id, quantity };
      })
      .filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantity) && item.quantity > 0);
  }, [categoryParam]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }
    if (!concertId) return;

    let cancelled = false;
    const fetchCheckoutData = async () => {
      try {
        const [concertResponse, seatsResponse] = await Promise.all([
          api.get(`/concerts/${concertId}`),
          api.get(`/concerts/${concertId}/seats`),
        ]);
        if (cancelled) return;

        if (concertResponse.data?.success) {
          setConcert(concertResponse.data.data);
        }
        setCustomerInfo({ name: user.name || '', email: user.email || '', phone: user.phone || '', nik: '' });

        if (seatsResponse.data?.success) {
          const seatData = seatsResponse.data.data || {};
          const categories = seatData.ticketCategories || [];
          const categoriesById = new Map(categories.map((ticketCategory) => [Number(ticketCategory.id), ticketCategory]));
          const chosenCategories = requestedCategories.map((request) => {
            const ticketCategory = categoriesById.get(request.id);
            if (!ticketCategory || request.quantity > Number(ticketCategory.available || 0)) return null;
            return {
              id: Number(ticketCategory.id),
              category: ticketCategory.category,
              price: Number(ticketCategory.price || 0),
              quantity: request.quantity,
            };
          });

          if (!requestedCategories.length || chosenCategories.some((ticketCategory) => !ticketCategory)) {
            toast.error('Kategori atau jumlah tiket sudah tidak tersedia');
            router.push(`/concerts/${concertId}`);
            return;
          }

          if (chosenCategories.reduce((sum, ticketCategory) => sum + ticketCategory.quantity, 0) > 10) {
            toast.error('Maksimal 10 tiket per pesanan');
            router.push(`/concerts/${concertId}`);
            return;
          }

          setSelectedTicketCategories(chosenCategories);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Checkout data error:', error);
        toast.error(error.response?.data?.message || 'Gagal memuat data checkout');
        router.push(`/concerts/${concertId}`);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    fetchCheckoutData();
    return () => {
      cancelled = true;
    };
  }, [concertId, loading, requestedCategories, router, user]);

  const subtotal = selectedTicketCategories.reduce((sum, ticketCategory) => sum + ticketCategory.price * ticketCategory.quantity, 0);
  const serviceFee = subtotal * 0.05;
  const discount = appliedPromo?.discount || 0;
  const total = Math.max(0, subtotal + serviceFee - discount);
  const saleStartTime = concert?.startSale ? new Date(concert.startSale).getTime() : null;
  const saleEndTime = concert?.endSale ? new Date(concert.endSale).getTime() : null;
  const saleNotStarted = saleStartTime !== null && saleStartTime > currentTime;
  const saleEnded = saleEndTime !== null && saleEndTime <= currentTime;
  const formatSaleDate = (value) => new Date(value).toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta'
  });

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error('Masukkan kode promo terlebih dahulu');
      return;
    }
    if (!concertId || subtotal <= 0) {
      toast.error('Pilih tiket sebelum menggunakan promo');
      return;
    }

    try {
      setValidatingPromo(true);
      const response = await api.get('/promos/validate', {
        params: { code, subtotal, concertId },
      });
      if (!response.data?.success || !response.data.data?.valid) {
        throw new Error(response.data?.message || 'Kode promo tidak valid');
      }
      setAppliedPromo(response.data.data);
      setPromoCode(response.data.data.code);
      toast.success('Promo berhasil digunakan');
    } catch (error) {
      setAppliedPromo(null);
      toast.error(error.response?.data?.message || error.message || 'Kode promo tidak dapat digunakan');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!user || !concertId) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    if (selectedTicketCategories.length === 0) {
      toast.error('Pilih kategori tiket terlebih dahulu');
      router.push(`/concerts/${concertId}`);
      return;
    }
    if (saleNotStarted || saleEnded) {
      toast.error(saleNotStarted
        ? `Penjualan tiket dibuka ${formatSaleDate(concert.startSale)} WIB`
        : 'Periode penjualan tiket konser ini sudah berakhir');
      return;
    }

    let createdOrderId;
    try {
      setPlacingOrder(true);

      const orderResponse = await api.post('/orders', {
        concertId: Number(concertId),
        categories: selectedTicketCategories.map((ticketCategory) => ({
          ticketCategoryId: ticketCategory.id,
          quantity: ticketCategory.quantity,
        })),
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerNIK: customerInfo.nik,
        ...(appliedPromo ? { promotionCode: appliedPromo.code } : {}),
      });

      if (!orderResponse.data?.success) {
        throw new Error(orderResponse.data?.message || 'Gagal membuat pesanan');
      }

      const orderId = orderResponse.data.data?.id;
      if (!orderId) {
        throw new Error('Order berhasil dibuat tetapi ID tidak tersedia');
      }
      createdOrderId = orderId;

      const paymentResponse = await api.post('/payments/create', {
        orderId,
      });

      if (!paymentResponse.data?.success) {
        throw new Error(paymentResponse.data?.message || 'Gagal membuat pembayaran');
      }

      const { snapToken, clientKey, isProduction, testMode } = paymentResponse.data.data || {};
      if (testMode) {
        toast.success('Pesanan uji coba berhasil. QR tiket sudah dibuat.');
        router.push(`/orders/${orderId}`);
        return;
      }
      if (!snapToken || !clientKey) {
        throw new Error('Token pembayaran dari gateway tidak tersedia');
      }

      await openMidtransSnap({
        snapToken,
        clientKey,
        isProduction,
        onSuccess: () => {
          toast.success('Pembayaran berhasil diproses');
          router.push(`/orders/${orderId}`);
        },
        onPending: () => {
          toast.success('Pembayaran menunggu konfirmasi');
          router.push(`/orders/${orderId}`);
        },
        onError: () => {
          toast.error('Pembayaran gagal. Periksa status pesanan untuk mencoba lagi.');
          router.push(`/orders/${orderId}`);
        },
        onClose: () => {
          toast('Checkout ditutup. Pesanan tetap tersimpan.');
          router.push(`/orders/${orderId}`);
        },
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || error.message || 'Checkout gagal');
      if (createdOrderId) router.push(`/orders/${createdOrderId}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-white">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-white/60">Memuat checkout...</p>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Data konser tidak ditemukan</p>
          <button onClick={() => router.push('/')} className="btn-primary mt-4">Kembali ke beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-primary/80">{t('Checkout')}</p>
          <h1 className="mt-2 text-4xl font-bold">{t('Ticket Payment')}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-2xl p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <FaTicketAlt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/50">Konser</p>
                <h2 className="text-2xl font-bold">{concert.name}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-white/60">Nama<input required className="input-field mt-2" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} /></label>
                <label className="text-sm text-white/60">Email<input required type="email" className="input-field mt-2" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} /></label>
                <label className="text-sm text-white/60">Nomor telepon<input required type="tel" className="input-field mt-2" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} /></label>
                <label className="text-sm text-white/60">NIK<input required inputMode="numeric" pattern="[0-9]{16}" maxLength={16} className="input-field mt-2" value={customerInfo.nik} onChange={(e) => setCustomerInfo({ ...customerInfo, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })} /></label>
              </div>
              <div className="rounded-xl border border-white/10 bg-dark/40 p-4">
                <p className="mb-2 text-sm text-white/50">{t('Tiket yang dipilih')}</p>
                <div className="space-y-2">
                  {selectedTicketCategories.map((ticketCategory) => (
                    <div key={ticketCategory.id} className="flex justify-between gap-4 text-sm">
                      <span>{ticketCategory.category} <span className="text-white/45">× {ticketCategory.quantity}</span></span>
                      <span className="text-white/75">{formatMoney(ticketCategory.price * ticketCategory.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <aside className="glass rounded-2xl p-6">
            <div className="mb-6">
              <p className="text-sm text-white/50">{t('Ringkasan')}</p>
              <h3 className="mt-2 text-2xl font-bold">{formatMoney(total)}</h3>
              {currency === 'USD' && <p className="mt-1 text-xs text-white/45">Pembayaran diproses dalam IDR.</p>}
            </div>

            {(saleNotStarted || saleEnded) && (
              <div role="status" className="mb-5 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
                {saleNotStarted
                  ? `Penjualan tiket dibuka ${formatSaleDate(concert.startSale)} WIB.`
                  : 'Periode penjualan tiket konser ini sudah berakhir.'}
              </div>
            )}

            <div className="space-y-3 text-sm text-white/70">
              <div className="mb-5 rounded-xl border border-white/10 bg-dark/40 p-4">
                <label htmlFor="promo-code" className="mb-2 block text-sm text-white/70">{t('Kode promo')}</label>
                <div className="flex gap-2">
                  <input
                    id="promo-code"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value);
                      setAppliedPromo(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void applyPromo();
                      }
                    }}
                    placeholder={t('Masukkan kode promo')}
                    className="input-field min-w-0 flex-1"
                    disabled={validatingPromo || placingOrder}
                  />
                  <button
                    type="button"
                    onClick={() => void applyPromo()}
                    disabled={validatingPromo || placingOrder || !promoCode.trim()}
                    className="btn-secondary shrink-0 disabled:opacity-50"
                  >
                    {validatingPromo ? <FaSpinner className="animate-spin" /> : appliedPromo ? t('Ganti') : t('Pakai')}
                  </button>
                </div>
                {appliedPromo && <p className="mt-2 text-xs text-emerald-300">Promo {appliedPromo.code} berhasil diterapkan.</p>}
              </div>
              <div className="flex justify-between">
                <span>{t('Subtotal')}</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Biaya layanan')}</span>
                <span>{formatMoney(serviceFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>{t('Diskon promo')}</span>
                  <span>- {formatMoney(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-white">
                <span>{t('Total')}</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={placingOrder || saleNotStarted || saleEnded}
              className="btn-primary mt-6 w-full justify-center"
            >
              {placingOrder ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaCheckCircle />
                  {saleNotStarted ? t('Penjualan belum dimulai') : saleEnded ? t('Penjualan berakhir') : t('Buat Pesanan')}
                </span>
              )}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={(
      <div className="min-h-screen flex items-center justify-center bg-dark text-white">
        <FaSpinner className="w-10 h-10 animate-spin text-primary" />
      </div>
    )}>
      <CheckoutContent />
    </Suspense>
  );
}
