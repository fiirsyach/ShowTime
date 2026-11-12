'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaSave, 
  FaSpinner,
  FaLock
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import CustomerLayout from '../../../components/CustomerLayout';
import { useSiteSettings } from '../../../context/SiteSettingsContext';

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

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { t } = useSiteSettings();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileStats, setProfileStats] = useState({ totalTickets: 0, upcomingEvents: 0, wishlistCount: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    country: '',
    address: ''
  });

  const loadProfile = async () => {
    const response = await api.get('/customer/profile');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Gagal memuat profil');
    }
    return response.data.data;
  };

  const applyProfile = (userData) => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      bio: userData.bio || '',
      city: userData.city || '',
      country: userData.country || '',
      address: userData.address || ''
    });
    setProfileStats({
      totalTickets: Number(userData.totalTickets) || 0,
      upcomingEvents: Number(userData.upcomingEvents) || 0,
      wishlistCount: Number(userData.wishlistCount) || 0
    });
  };

  const fetchProfile = async () => {
    try {
      applyProfile(await loadProfile());
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || error.message || 'Gagal memuat profil');
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    let active = true;
    loadProfile()
      .then((userData) => {
        if (active) applyProfile(userData);
      })
      .catch((error) => {
        if (active) {
          console.error('Error fetching profile:', error);
          toast.error(error.response?.data?.message || error.message || 'Gagal memuat profil');
        }
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [user, loading, router]);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put('/customer/profile', formData);
      if (response.data.success) {
        const updatedUser = response.data.data;
        setFormData((current) => ({
          ...current,
          name: updatedUser.name || '',
          phone: updatedUser.phone || '',
          bio: updatedUser.bio || '',
          city: updatedUser.city || '',
          country: updatedUser.country || '',
          address: updatedUser.address || ''
        }));
        toast.success('Profil berhasil diperbarui!');
        setIsEditing(false);
      } else {
        toast.error(response.data.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await api.put('/customer/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal mengubah password');
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password berhasil diperbarui');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-white/60">{t('Loading profile...')}</p>
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
            <h1 className="text-4xl font-bold mb-2">{t('Profile')}</h1>
            <p className="text-white/60">{t('Manage your account information')}</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass p-8 rounded-2xl">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold">
                  {(formData.name || user.name)?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{formData.name || user.name}</h2>
                  <p className="text-white/60">{user.email}</p>
                  <span className="px-3 py-1 glass rounded-full text-xs text-white/60 inline-block mt-2">
                    🎫 Customer
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <FaEdit />
                  {t('Edit Profile')}
                </button>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">{t('Full Name')}</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="input-field pl-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">{t('Email')}</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="input-field pl-12 opacity-60"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">{t('Phone')}</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">{t('City')}</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-12"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('Address')}</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="2"
                  className="input-field"
                  placeholder={t('Your address')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('Bio')}</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  className="input-field"
                  placeholder={t('Tell us about yourself...')}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="px-6 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button type="submit" disabled={savingProfile} className="btn-primary disabled:cursor-wait disabled:opacity-60">
                    {savingProfile ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
                    {savingProfile ? t('Saving...') : t('Save Changes')}
                  </button>
                </div>
              )}
            </form>

            <form onSubmit={handlePasswordChange} className="mt-6 border-t border-white/10 pt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <FaLock className="text-primary" />
                  {t('Change Password')}
                </h3>
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                  {t('Forgot password?')}
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="input-field"
                  placeholder={t('Current password')}
                  aria-label={t('Current password')}
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className="input-field"
                  placeholder={t('New password (min. 8 characters)')}
                  aria-label={t('New password (min. 8 characters)')}
                  minLength={8}
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="input-field"
                  placeholder={t('Confirm new password')}
                  aria-label={t('Confirm new password')}
                  minLength={8}
                  required
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={savingPassword} className="btn-primary disabled:cursor-wait disabled:opacity-60">
                  {savingPassword ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaLock className="h-4 w-4" />}
                  {savingPassword ? t('Saving...') : t('Save Password')}
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">{profileStats.totalTickets}</p>
                <p className="text-sm text-white/60">{t('Tickets')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">{profileStats.upcomingEvents}</p>
                <p className="text-sm text-white/60">{t('Upcoming')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">{profileStats.wishlistCount}</p>
                <p className="text-sm text-white/60">Wishlist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}