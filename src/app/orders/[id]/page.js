'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import CustomerLayout from '../../../../components/CustomerLayout';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaSpinner, FaTicketAlt } from 'react-icons/fa';
import { openMidtransSnap } from '../../../lib/midtrans';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoadingOrder(true);
      const response = await api.get(`/customer/orders/${id}`);
      if (response.data.success) setOrder(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail pesanan');
      if (error.response?.status === 404) router.push('/orders');
    } finally {
      setLoadingOrder(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!user || !id) return undefined;
    const timeout = setTimeout(() => { void fetchOrder(); }, 0);
    return () => clearTimeout(timeout);
  }, [loading, user, id, fetchOrder, router]);

  useEffect(() => {
    if (!order?.expiryDate || order.status !== 'pending') {
      return;
    }
    const updateCountdown = () => setSecondsRemaining(Math.max(0, Math.floor((new Date(order.expiryDate).getTime() - Date.now()) / 1000)));
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [order?.expiryDate, order?.status]);

  useEffect(() => {
    if (order?.status !== 'pending') return undefined;
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/customer/orders/${id}`);
        if (response.data.success) setOrder(response.data.data);
      } catch (error) {
        console.error('Payment status refresh failed:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [order?.status, id]);

  const cancelOrder = async () => {
    if (!confirm('Batalkan pesanan ini?')) return;
    try {
      setCancelling(true);
      await api.put(`/orders/${id}/cancel`);
      toast.success('Pesanan dibatalkan');
      await fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(false);
    }
  };

  const confirmPaymentResult = async () => {
    setPaymentResult('verifying');

    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        const response = await api.get(`/customer/orders/${id}`);
        if (response.data.success) {
          const latestOrder = response.data.data;
          setOrder(latestOrder);
          if (latestOrder.status === 'paid' || latestOrder.orderPayment?.status === 'completed') {
            setPaymentResult('success');
            toast.success('Pembayaran berhasil. Tiket dan barcode sudah tersedia.');
            return;
          }
        }
      } catch (error) {
        console.error('Payment confirmation refresh failed:', error);
      }

      if (attempt < 19) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setPaymentResult('verification-pending');
  };

  const continuePayment = async () => {
    try {
      setProcessingPayment(true);
      const response = await api.post('/payments/create', {
        orderId: order.id,
      });
      const { snapToken, clientKey, isProduction, testMode } = response.data?.data || {};
      if (testMode) {
        toast.success('Pesanan uji coba berhasil. QR tiket sudah dibuat.');
        await fetchOrder();
        return;
      }
      if (!snapToken || !clientKey) throw new Error('Sesi pembayaran tidak tersedia');

      await openMidtransSnap({
        snapToken,
        clientKey,
        isProduction,
        onSuccess: () => { void confirmPaymentResult(); },
        onPending: () => {
          setPaymentResult('pending');
          toast.success('Pembayaran menunggu konfirmasi');
          fetchOrder();
        },
        onError: () => {
          setPaymentResult('failed');
          toast.error('Pembayaran gagal. Silakan periksa status pesanan.');
        },
        onClose: () => toast('Checkout ditutup. Pesanan tetap tersimpan.'),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal membuka pembayaran');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading || loadingOrder) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-white">
          <FaSpinner className="h-9 w-9 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!user || !order) return null;

  const concert = order.concert;
  const payment = order.orderPayment;
  const displayedPaymentResult = order.status === 'paid' || payment?.status === 'completed'
    ? 'success'
    : paymentResult;
  const paymentResultMessage = {
    verifying: 'Midtrans mengirim hasil berhasil. Sedang memverifikasi pembayaran dan menyiapkan tiket...',
    success: 'Pembayaran berhasil. Tiket dan barcode sudah tersedia.',
    pending: 'Pembayaran menunggu konfirmasi Midtrans. Status pesanan akan diperbarui otomatis.',
    'verification-pending': 'Pembayaran berhasil di Midtrans, tetapi konfirmasi tiket belum diterima. Status akan diperbarui otomatis.',
    failed: 'Pembayaran gagal. Silakan periksa status pesanan atau coba kembali.'
  }[displayedPaymentResult];

  return (
    <CustomerLayout>
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <button onClick={() => router.push('/orders')} className="mb-8 flex items-center gap-2 text-white/60 hover:text-white">
          <FaArrowLeft /> Kembali ke pesanan
        </button>

        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-primary">Detail pesanan</p>
            <h1 className="mt-1 text-3xl font-bold">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-white/50">Dibuat {new Date(order.createdAt).toLocaleString('id-ID')}</p>
          </div>
          <span className={`rounded-full border px-4 py-2 text-sm ${
            order.status === 'paid'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              : 'border-white/10'
          }`}>{order.status === 'paid' ? 'Berhasil' : order.status}</span>
        </header>

        {paymentResultMessage && (
          <div className={`mb-6 rounded-lg border p-4 text-sm ${
            displayedPaymentResult === 'success'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
              : displayedPaymentResult === 'failed'
                ? 'border-red-400/30 bg-red-400/10 text-red-200'
                : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-100'
          }`} role="status" aria-live="polite">
            {paymentResultMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold">{concert?.name || 'Konser'}</h2>
              <div className="mt-4 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                <p className="flex items-center gap-2"><FaCalendarAlt className="text-primary" />{concert?.date ? new Date(concert.date).toLocaleDateString('id-ID') : '-'}</p>
                <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary" />{concert?.venue?.name || concert?.venueName || '-'}</p>
                <p className="sm:col-span-2">{concert?.venue?.address || concert?.address || ''} {concert?.venue?.city || concert?.city || ''}</p>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="mb-4 text-lg font-semibold">Tiket ({order.orderTickets?.length || 0})</h2>
              <div className="divide-y divide-white/10">
                {(order.orderTickets || []).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <FaTicketAlt className="text-primary" />
                      <div>
                        <p className="font-medium">{ticket.seat ? `${ticket.seat.row}-${ticket.seat.number}` : ticket.category}</p>
                        <p className="text-xs text-white/50">{ticket.ticketNumber} · {ticket.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ticket.qrCode && ticket.status === 'active' && (
                        <Image src={ticket.qrCode} alt={`QR ${ticket.ticketNumber}`} width={64} height={64} unoptimized className="h-16 w-16 rounded bg-white p-1" />
                      )}
                      <p>Rp {Number(ticket.price || 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
                {!order.orderTickets?.length && <p className="py-4 text-sm text-white/50">Belum ada tiket pada pesanan ini.</p>}
              </div>
            </div>
          </section>

          <aside className="glass h-fit rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Ringkasan pembayaran</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between text-white/60"><dt>Subtotal</dt><dd>Rp {Number(order.subtotal || order.totalAmount).toLocaleString('id-ID')}</dd></div>
              <div className="flex justify-between text-white/60"><dt>Biaya layanan</dt><dd>Rp {Number(order.serviceFee || 0).toLocaleString('id-ID')}</dd></div>
              <div className="flex justify-between text-white/60"><dt>Diskon</dt><dd>Rp {Number(order.discount || 0).toLocaleString('id-ID')}</dd></div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold"><dt>Total</dt><dd>Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}</dd></div>
              <div className="flex justify-between text-white/60"><dt>Metode</dt><dd>{payment?.paymentData?.gateway === 'midtrans' ? 'Midtrans' : payment?.paymentData?.gateway === 'disabled' ? 'Mode uji coba' : payment?.method || order.paymentMethod || '-'}</dd></div>
              <div className="flex justify-between text-white/60"><dt>Pembayaran</dt><dd>{payment?.status === 'completed' ? 'Berhasil' : payment?.status || 'Menunggu pembayaran'}</dd></div>
            </dl>
            {order.status === 'pending' && secondsRemaining !== null && (
              <p className="mt-4 rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-3 text-sm text-yellow-200">
                {secondsRemaining > 0
                  ? `Selesaikan pembayaran sebelum ${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}.`
                  : 'Waktu habis. Pesanan sedang dibatalkan otomatis.'}
              </p>
            )}
            {order.status === 'pending' && (!payment || ['pending', 'processing', 'failed'].includes(payment.status)) && (
              <button
                onClick={continuePayment}
                disabled={processingPayment || secondsRemaining === 0}
                className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {processingPayment ? 'Membuka pembayaran...' : 'Lanjutkan pembayaran'}
              </button>
            )}
            {order.status === 'pending' && (
              <button onClick={cancelOrder} disabled={cancelling} className="mt-3 w-full rounded-lg border border-red-400/30 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50">
                {cancelling ? 'Membatalkan...' : 'Batalkan pesanan'}
              </button>
            )}
          </aside>
        </div>
      </main>
    </CustomerLayout>
  );
}
