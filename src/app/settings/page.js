'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FaUser, 
  FaLock, 
  FaBell, 
  FaShieldAlt, 
  FaSpinner,
  FaSave
} from 'react-icons/fa';
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

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-white/60">Loading...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setLoadingPassword(true);
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password berhasil diubah!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoadingPassword(false);
    }
  };

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
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-white/60">Manage your account settings</p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 glass p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'account' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaUser className="inline mr-2" />
              Account
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'security' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaLock className="inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notifications' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaBell className="inline mr-2" />
              Notifications
            </button>
          </div>

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Language</label>
                  <select className="input-field">
                    <option value="id">Indonesian</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Timezone</label>
                  <select className="input-field">
                    <option value="Asia/Jakarta">Asia/Jakarta (GMT+7)</option>
                    <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                  <select className="input-field">
                    <option value="IDR">Indonesian Rupiah (Rp)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
                <button className="btn-primary w-full justify-center">
                  <FaSave className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input-field pl-12"
                      required
                      disabled={loadingPassword}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input-field pl-12"
                      required
                      disabled={loadingPassword}
                      minLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input-field pl-12"
                      required
                      disabled={loadingPassword}
                      minLength={6}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loadingPassword} className="btn-primary w-full justify-center">
                  {loadingPassword ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    <>
                      <FaShieldAlt className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-white/60 mb-3">Add an extra layer of security to your account.</p>
                <button className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass rounded-xl">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-white/60">Receive updates about your tickets and events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-xl">
                  <div>
                    <h4 className="font-medium">Event Reminders</h4>
                    <p className="text-sm text-white/60">Get reminded before your upcoming events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-xl">
                  <div>
                    <h4 className="font-medium">Promotional Offers</h4>
                    <p className="text-sm text-white/60">Receive special offers and discounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}