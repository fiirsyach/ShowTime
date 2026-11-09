'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function OrganizerWithdrawalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: '', bankName: '', bankAccount: '', bankHolder: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && user.role !== 'organizer') router.push('/dashboard');
    if (user?.role === 'organizer') loadWithdrawals();
  }, [loading, user]);

  const loadWithdrawals = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/organizer/withdrawals');
      if (response.data.success) setWithdrawals(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat riwayat penarikan');
    } finally {
      setLoadingData(false);
    }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/organizer/withdraw', { ...form, amount: Number(form.amount) });
      toast.success('Permintaan penarikan dikirim');
      setForm({ amount: '', bankName: '', bankAccount: '', bankHolder: '' });
      await loadWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (id) => {
    try {
      await api.put(`/organizer/withdrawals/${id}/cancel`);
      toast.success('Permintaan dibatalkan');
      await loadWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan permintaan');
    }
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center bg-dark text-white"><FaSpinner className="h-9 w-9 animate-spin text-primary" /></div>;
  }
  if (!user || user.role !== 'organizer') return null;

  return (
    <main className="min-h-screen bg-dark px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/organizer/revenue" className="mb-7 inline-flex items-center gap-2 text-white/60 hover:text-white"><FaArrowLeft /> Revenue</Link>
        <h1 className="text-3xl font-bold">Penarikan dana</h1>
        <p className="mt-2 text-white/60">Permintaan dihitung dari saldo pembayaran yang sudah selesai.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form onSubmit={submitRequest} className="glass h-fit space-y-4 rounded-xl p-6">
            <h2 className="text-lg font-semibold">Ajukan penarikan</h2>
            <label className="block text-sm text-white/70">Jumlah (Rp)
              <input className="input-field mt-2" type="number" min="1" step="1" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </label>
            <label className="block text-sm text-white/70">Nama bank
              <input className="input-field mt-2" required value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
            </label>
            <label className="block text-sm text-white/70">Nomor rekening
              <input className="input-field mt-2" required value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} />
            </label>
            <label className="block text-sm text-white/70">Nama pemilik rekening
              <input className="input-field mt-2" required value={form.bankHolder} onChange={(e) => setForm({ ...form, bankHolder: e.target.value })} />
            </label>
            <button className="btn-primary w-full justify-center" disabled={submitting}>
              {submitting ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />} Kirim permintaan
            </button>
          </form>

          <section className="glass rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Riwayat penarikan</h2>
            {withdrawals.length ? <div className="divide-y divide-white/10">
              {withdrawals.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
                  <div>
                    <p className="font-semibold">Rp {Number(item.amount).toLocaleString('id-ID')}</p>
                    <p className="mt-1 text-sm text-white/50">{item.bankName} · {item.bankAccount} · {new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                    {item.rejectionReason && <p className="mt-1 text-sm text-red-300">Alasan: {item.rejectionReason}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize">{item.status}</span>
                    {item.status === 'pending' && <button onClick={() => cancelRequest(item.id)} className="text-sm text-red-300 hover:text-red-200">Batalkan</button>}
                  </div>
                </article>
              ))}
            </div> : <div className="py-10 text-center text-white/50">Belum ada permintaan penarikan.</div>}
          </section>
        </div>
      </div>
    </main>
  );
}