'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../../../context/AuthContext';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const emptyForm = { name: '', description: '', date: '', time: '', startSale: '', endSale: '', venueName: '', city: '', address: '', genre: '' };

export default function EditOrganizerConcertPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [concert, setConcert] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && user.role !== 'organizer') router.push('/dashboard');
    if (user?.role === 'organizer' && id) loadConcert();
  }, [loading, user, id]);

  const loadConcert = async () => {
    try {
      const response = await api.get(`/organizer/concerts/${id}`);
      if (!response.data.success) throw new Error('Konser tidak ditemukan');
      const item = response.data.data;
      setConcert(item);
      setForm({
        name: item.name || '',
        description: item.description || '',
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
        time: item.time || '',
        startSale: item.startSale ? new Date(item.startSale).toISOString().slice(0, 16) : '',
        endSale: item.endSale ? new Date(item.endSale).toISOString().slice(0, 16) : '',
        venueName: item.venueName || '',
        city: item.city || '',
        address: item.address || '',
        genre: item.genre || '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal memuat konser');
      router.push('/organizer/concerts');
    } finally {
      setLoadingData(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.put(`/organizer/concerts/${id}`, {
        ...form,
        startSale: form.startSale || null,
        endSale: form.endSale || null
      });
      toast.success('Konser diperbarui');
      router.push('/organizer/concerts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui konser');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingData) return <div className="min-h-screen flex items-center justify-center bg-dark text-white"><FaSpinner className="h-9 w-9 animate-spin text-primary" /></div>;
  if (!user || user.role !== 'organizer' || !concert) return null;

  return (
    <main className="min-h-screen bg-dark px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/organizer/concerts" className="mb-6 inline-flex items-center gap-2 text-white/60 hover:text-white"><FaArrowLeft /> Konser saya</Link>
        <h1 className="text-3xl font-bold">Edit konser</h1>
        <p className="mt-2 text-sm text-white/50">Status saat ini: {concert.status}</p>
        <form onSubmit={submit} className="glass mt-7 grid gap-4 rounded-xl p-6 sm:grid-cols-2">
          <label className="text-sm text-white/70 sm:col-span-2">Nama konser<input required className="input-field mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="text-sm text-white/70">Tanggal<input required type="date" className="input-field mt-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label className="text-sm text-white/70">Waktu<input required type="time" className="input-field mt-2" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
          <label className="text-sm text-white/70">Mulai penjualan tiket<input type="datetime-local" className="input-field mt-2" value={form.startSale} onChange={(e) => setForm({ ...form, startSale: e.target.value })} /></label>
          <label className="text-sm text-white/70">Akhir penjualan tiket<input type="datetime-local" className="input-field mt-2" min={form.startSale || undefined} value={form.endSale} onChange={(e) => setForm({ ...form, endSale: e.target.value })} /></label>
          <label className="text-sm text-white/70">Venue<input className="input-field mt-2" value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} /></label>
          <label className="text-sm text-white/70">Kota<input className="input-field mt-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label className="text-sm text-white/70 sm:col-span-2">Alamat<input className="input-field mt-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <label className="text-sm text-white/70">Genre<input className="input-field mt-2" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></label>
          <div className="rounded-lg border border-white/10 p-4 text-sm text-white/60 sm:col-span-2">
            Inventory mengikuti kursi dan kategori tiket. Kapasitas {Number(concert.totalTickets || 0).toLocaleString('id-ID')}; harga Rp {Number(concert.minPrice || 0).toLocaleString('id-ID')}–Rp {Number(concert.maxPrice || 0).toLocaleString('id-ID')}.
          </div>
          <label className="text-sm text-white/70 sm:col-span-2">Deskripsi<textarea className="input-field mt-2 min-h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Link href="/organizer/concerts" className="rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70">Batal</Link>
            <button disabled={saving} className="btn-primary" type="submit">{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}