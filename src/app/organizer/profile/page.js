'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSpinner, FaUserTie } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  description: '',
  website: '',
  instagram: '',
  youtube: '',
  city: '',
  address: '',
  verificationStatus: 'pending'
};

export default function OrganizerProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(emptyProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return undefined;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return undefined;
    }
    if (user?.role !== 'organizer') return undefined;

    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const response = await api.get('/organizer/profile');
        if (cancelled) return;
        const data = response.data.data;
        setProfile({
          ...emptyProfile,
          ...data,
          name: data.user?.name || user.name || '',
          email: data.user?.email || user.email || '',
          phone: data.user?.phone || ''
        });
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.message || 'Gagal memuat profil organizer');
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/organizer/profile', {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        companyName: profile.companyName.trim(),
        description: profile.description,
        website: profile.website,
        instagram: profile.instagram,
        youtube: profile.youtube,
        city: profile.city.trim(),
        address: profile.address.trim()
      });
      const data = response.data.data;
      setProfile((current) => ({
        ...current,
        ...data,
        name: data.user?.name || current.name,
        email: data.user?.email || current.email,
        phone: data.user?.phone || ''
      }));
      toast.success('Profil organizer berhasil diperbarui');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center">
        <FaSpinner className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  if (!user || user.role !== 'organizer') return null;

  const fields = [
    ['companyName', 'Nama penyelenggara', true],
    ['city', 'Kota', true],
    ['website', 'Website', false],
    ['instagram', 'Instagram', false],
    ['youtube', 'YouTube', false]
  ];

  return (
    <main className="min-h-screen bg-dark px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/organizer/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <FaArrowLeft /> Kembali ke dashboard
        </Link>
        <section className="glass rounded-2xl p-6 md:p-8">
          <header className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
              <FaUserTie className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Profil Organizer</h1>
              <p className="text-sm text-white/60">Informasi ini digunakan untuk identitas dan kontak penyelenggara.</p>
            </div>
            <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/70">
              Verifikasi: {profile.verificationStatus}
            </span>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span>Nama kontak *</span>
                <input name="name" value={profile.name} onChange={updateField} className="input-field" required maxLength={100} />
              </label>
              <label className="space-y-2 text-sm">
                <span>Email akun</span>
                <input value={profile.email} className="input-field opacity-60" readOnly />
              </label>
              <label className="space-y-2 text-sm">
                <span>Nomor telepon</span>
                <input name="phone" value={profile.phone} onChange={updateField} className="input-field" maxLength={32} />
              </label>
              {fields.map(([name, label, required]) => (
                <label key={name} className="space-y-2 text-sm">
                  <span>{label}{required ? ' *' : ''}</span>
                  <input
                    name={name}
                    value={profile[name] || ''}
                    onChange={updateField}
                    className="input-field"
                    required={required}
                    maxLength={name === 'companyName' ? 150 : 255}
                  />
                </label>
              ))}
              <label className="space-y-2 text-sm md:col-span-2">
                <span>Alamat penyelenggara *</span>
                <textarea name="address" value={profile.address} onChange={updateField} className="input-field" rows={3} required maxLength={2000} />
              </label>
              <label className="space-y-2 text-sm md:col-span-2">
                <span>Deskripsi</span>
                <textarea name="description" value={profile.description || ''} onChange={updateField} className="input-field" rows={4} maxLength={5000} />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary min-w-36 justify-center disabled:opacity-60">
                {saving ? <FaSpinner className="animate-spin" /> : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
