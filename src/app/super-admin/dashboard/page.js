'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FaHome, 
  FaUsers, 
  FaUserCheck, 
  FaMusic, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCog, 
  FaSignOutAlt,
  FaFileAlt,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth
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

export default function SuperAdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingData, setLoadingData] = useState(true);
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [exportingReport, setExportingReport] = useState('');
  const [settings, setSettings] = useState({
    siteName: 'ConcertHub',
    siteDescription: 'Concert Ticket Booking Platform',
    currency: 'IDR',
    emailVerification: true,
    twoFactorAuth: false,
    maintenanceMode: false
  });

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  }, []);

  const fetchOrganizers = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/organizers');
      if (response.data.success) {
        setOrganizers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching organizers:', error);
      toast.error('Failed to load organizers');
    }
  }, []);

  const fetchConcerts = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/concerts');
      if (response.data.success) {
        setConcerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast.error('Failed to load concerts');
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/payments');
      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/reports?type=overview');
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat ringkasan laporan');
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get('/super-admin/system');
      if (response.data.success) {
        setSettings((current) => ({ ...current, ...response.data.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchDashboard(),
        fetchUsers(),
        fetchOrganizers(),
        fetchConcerts(),
        fetchPayments(),
        fetchReports(),
        fetchAnalytics(),
        fetchSettings()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoadingData(false);
    }
  }, [fetchDashboard, fetchUsers, fetchOrganizers, fetchConcerts, fetchPayments, fetchReports, fetchAnalytics, fetchSettings]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
    if (user && user.role === 'super_admin') {
      Promise.resolve().then(fetchAllData);
    }
  }, [user, loading, router, fetchAllData]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // ==================== HANDLE VERIFY ORGANIZER ====================
const handleVerifyOrganizer = async (userId) => {
  if (!confirm('Apakah Anda yakin ingin memverifikasi organizer ini?')) return;
  
  try {
    console.log('🔍 Verifying organizer:', userId);
    const response = await api.put(`/super-admin/organizers/${userId}/verify`);
    
    if (response.data.success) {
      toast.success('✅ Organizer berhasil diverifikasi!');
      fetchOrganizers(); // Refresh data
      fetchDashboard(); // Refresh dashboard stats
    }
  } catch (error) {
    console.error('❌ Error verifying organizer:', error);
    toast.error(error.response?.data?.message || 'Gagal memverifikasi organizer');
  }
};

// ==================== HANDLE REJECT ORGANIZER ====================
const handleRejectOrganizer = async (userId) => {
  // Prompt reason
  const reason = prompt('Masukkan alasan penolakan:');
  if (reason === null) return; // User cancel
  
  if (!reason.trim()) {
    toast.error('Alasan penolakan wajib diisi');
    return;
  }
  
  try {
    console.log('🔍 Rejecting organizer:', userId);
    console.log('📝 Reason:', reason);
    
    const response = await api.put(`/super-admin/organizers/${userId}/reject`, {
      reason: reason.trim()
    });
    
    if (response.data.success) {
      toast.success('❌ Organizer berhasil ditolak!');
      fetchOrganizers(); // Refresh data
      fetchDashboard(); // Refresh dashboard stats
    }
  } catch (error) {
    console.error('❌ Error rejecting organizer:', error);
    toast.error(error.response?.data?.message || 'Gagal menolak organizer');
  }
};

const handleConcertModeration = async (concertId, action) => {
  try {
    const response = await api.put(`/super-admin/concerts/${concertId}/${action}`);
    if (response.data.success) {
      toast.success(action === 'approve' ? 'Konser disetujui' : 'Konser ditolak');
      await Promise.all([fetchConcerts(), fetchDashboard()]);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal memoderasi konser');
  }
};

const handleConfirmPayment = async (paymentId) => {
  try {
    const response = await api.put(`/super-admin/payments/${paymentId}/confirm`);
    if (response.data.success) {
      toast.success('Pembayaran dikonfirmasi');
      await Promise.all([fetchPayments(), fetchDashboard()]);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal mengonfirmasi pembayaran');
  }
};

const handleRefundPayment = async (payment) => {
  const reason = prompt('Alasan refund:');
  if (!reason?.trim()) return;
  try {
    const response = await api.post(`/super-admin/payments/${payment.id}/refund`, {
      reason: reason.trim(),
      amount: Number(payment.amount),
    });
    if (response.data.success) {
      toast.success('Refund dicatat; transfer dana dilakukan manual/gateway');
      await Promise.all([fetchPayments(), fetchDashboard()]);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal memproses refund');
  }
};

const handleToggleUserStatus = async (userItem) => {
  const status = userItem.status === 'blocked' ? 'active' : 'blocked';
  try {
    const response = await api.put(`/super-admin/users/${userItem.id}`, {
      name: userItem.name,
      email: userItem.email,
      phone: userItem.phone,
      role: userItem.role,
      status,
    });
    if (response.data.success) {
      toast.success(status === 'blocked' ? 'Akun diblokir' : 'Blokir akun dibuka');
      await fetchUsers();
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal memperbarui akun');
  }
};

const handleDeleteUser = async (userId) => {
  if (!confirm('Hapus akun pengguna ini?')) return;
  try {
    const response = await api.delete(`/super-admin/users/${userId}`);
    if (response.data.success) {
      toast.success('Akun pengguna dihapus');
      await Promise.all([fetchUsers(), fetchDashboard()]);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menghapus akun');
  }
};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return { color: 'text-green-400 bg-green-400/10', icon: FaCheckCircle };
      case 'pending':
        return { color: 'text-yellow-400 bg-yellow-400/10', icon: FaClock };
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return { color: 'text-red-400 bg-red-400/10', icon: FaTimesCircle };
      default:
        return { color: 'text-white/40 bg-white/5', icon: FaClock };
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSettings = async () => {
    try {
      const response = await api.put('/super-admin/system', settings);
      if (response.data.success) {
        toast.success('Pengaturan berhasil disimpan');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan');
    }
  };

  const downloadSalesReport = async () => {
    try {
      setExportingReport('payments');
      const response = await api.get('/super-admin/reports', { params: { type: 'payments' } });
      const rows = Array.isArray(response.data.data) ? response.data.data : [];
      if (!rows.length) {
        toast.error('Tidak ada data untuk diunduh');
        return;
      }

      const columns = ['ID Pembayaran', 'Tanggal', 'Pelanggan', 'Email', 'Konser', 'Metode', 'Status', 'Jumlah', 'Jumlah Refund'];
      const values = rows.map((row) => [
        row.id,
        row.createdAt,
        row.order?.user?.name,
        row.order?.user?.email,
        row.order?.concert?.name,
        row.method,
        row.status,
        row.amount,
        row.refundAmount
      ]);
      const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
      const csv = [columns, ...values].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
      const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Laporan berhasil diunduh');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh laporan');
    } finally {
      setExportingReport('');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  // Calculate stats
  const stats = {
    totalUsers: dashboardData?.stats?.totalUsers || users.length || 0,
    totalOrganizers: dashboardData?.stats?.totalOrganizers || organizers.length || 0,
    pendingOrganizers: dashboardData?.stats?.pendingOrganizers || organizers.filter(o => o.verificationStatus === 'pending').length || 0,
    totalConcerts: dashboardData?.stats?.totalConcerts || concerts.length || 0,
    pendingConcerts: dashboardData?.stats?.pendingConcerts || concerts.filter(c => c.status === 'pending').length || 0,
    totalPayments: dashboardData?.stats?.totalPayments ?? payments.length,
    totalRevenue: dashboardData?.stats?.totalRevenue || 0,
    pendingPayments: payments.filter(p => p.status === 'pending').length || 0
  };
  const filteredUsers = users.filter((userItem) => {
    const query = userSearch.trim().toLowerCase();
    return !query || [userItem.name, userItem.email, userItem.role, userItem.status]
      .some((value) => String(value || '').toLowerCase().includes(query));
  });

  // Render functions...
  // (Sama seperti sebelumnya tapi menggunakan data dari API)

  return (
    <div className="min-h-screen bg-dark">
      {/* Sidebar - Sama seperti sebelumnya */}
      <div className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/5 p-6 z-50 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gradient">ConcertHub</h2>
          <p className="text-xs text-white/40 mt-1">Super Admin</p>
          <p className="text-xs text-primary mt-1">👑 Full Access</p>
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'dashboard' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaHome className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaUsers className="w-5 h-5" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button
            onClick={() => setActiveTab('organizers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'organizers' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaUserCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Verify Organizer</span>
          </button>
          <button
            onClick={() => setActiveTab('concerts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'concerts' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaMusic className="w-5 h-5" />
            <span className="text-sm font-medium">Manage Konser</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'payments' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaMoneyBillWave className="w-5 h-5" />
            <span className="text-sm font-medium">Manage Payments</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'reports' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaFileAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaChartLine className="w-5 h-5" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaCog className="w-5 h-5" />
            <span className="text-sm font-medium">System Settings</span>
          </button>
          <div className="pt-4 mt-4 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
              <p className="text-white/60 mt-1">Super Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 glass rounded-full text-xs text-primary">
                👑 {user?.name}
              </span>
              <button 
                onClick={() => { setLoadingData(true); fetchAllData(); }}
                className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <FaSpinner className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Render content based on active tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Users</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <FaUsers className="text-primary text-xl" />
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Organizers</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalOrganizers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <FaBuilding className="text-secondary text-xl" />
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Pending Verifications</p>
                      <p className="text-2xl font-bold mt-1 text-yellow-400">{stats.pendingOrganizers + stats.pendingConcerts}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <FaClock className="text-yellow-500 text-xl" />
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-gradient mt-1">
                        Rp {stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <FaMoneyBillWave className="text-green-500 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="glass p-6 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
                <div className="space-y-3">
                  {dashboardData?.recentUsers?.slice(0, 5).map((userItem) => (
                    <div key={userItem.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <FaUserCheck className="text-primary w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{userItem.name} registered</p>
                        <p className="text-xs text-white/40">as {userItem.role} • {new Date(userItem.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Manage Users</h2>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text" 
                    placeholder="Search users..." 
                    className="input-field pl-10 py-2 text-sm w-48"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                  />
                </div>
              </div>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr className="text-left text-white/40 text-sm">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((userItem) => {
                        const statusBadge = getStatusBadge(userItem.status);
                        const StatusIcon = statusBadge.icon;
                        return (
                          <tr key={userItem.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium">{userItem.name}</td>
                            <td className="px-6 py-4 text-white/60">{userItem.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 glass rounded-full text-xs capitalize">
                                {userItem.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {userItem.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                                  <FaEye className="w-4 h-4 text-white/60" />
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(userItem)}
                                  title={userItem.status === 'blocked' ? 'Unblock user' : 'Block user'}
                                  disabled={userItem.role === 'super_admin'}
                                  className="p-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
                                >
                                  <FaEdit className="w-4 h-4 text-primary" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userItem.id)}
                                  title="Delete user"
                                  disabled={userItem.role === 'super_admin'}
                                  className="p-2 glass rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40"
                                >
                                  <FaTrash className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {!filteredUsers.length && (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-white/50">Tidak ada pengguna yang cocok.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organizers' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Verify Organizers</h2>
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr className="text-left text-white/40 text-sm">
                          <th className="px-6 py-3">Company</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {organizers.map((organizer) => {
                          const statusBadge = getStatusBadge(organizer.verificationStatus);
                          const StatusIcon = statusBadge.icon;
                          return (
                            <tr key={organizer.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium">{organizer.companyName}</td>
                              <td className="px-6 py-4 text-white/60">{organizer.user?.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {organizer.verificationStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  {organizer.verificationStatus === 'pending' && (
                                    <>
                                      <button 
                                        onClick={() => handleVerifyOrganizer(organizer.userId)}
                                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors flex items-center gap-1"
                                      >
                                        <FaCheckCircle className="w-3 h-3" />
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleRejectOrganizer(organizer.userId)}
                                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1"
                                      >
                                        <FaTimesCircle className="w-3 h-3" />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                                    <FaEye className="w-4 h-4 text-white/60" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          {activeTab === 'concerts' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Manage Concerts</h2>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr className="text-left text-white/40 text-sm">
                        <th className="px-6 py-3">Concert</th>
                        <th className="px-6 py-3">Organizer</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {concerts.map((concert) => {
                        const statusBadge = getStatusBadge(concert.status);
                        const StatusIcon = statusBadge.icon;
                        return (
                          <tr key={concert.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium">{concert.name}</td>
                            <td className="px-6 py-4 text-white/60">{concert.organizer?.name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {concert.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {concert.status === 'pending' && (
                                  <>
                                    <button onClick={() => handleConcertModeration(concert.id, 'approve')} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors flex items-center gap-1">
                                      <FaCheckCircle className="w-3 h-3" />
                                      Approve
                                    </button>
                                    <button onClick={() => handleConcertModeration(concert.id, 'reject')} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1">
                                      <FaTimesCircle className="w-3 h-3" />
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                                  <FaEye className="w-4 h-4 text-white/60" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Manage Payments</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="glass p-4 rounded-xl">
                  <p className="text-white/60 text-sm">Total Payments</p>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-white/60 text-sm">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendingPayments}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-gradient">Rp {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr className="text-left text-white/40 text-sm">
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => {
                        const statusBadge = getStatusBadge(payment.status);
                        const StatusIcon = statusBadge.icon;
                        return (
                          <tr key={payment.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium">{payment.order?.user?.name}</td>
                            <td className="px-6 py-4 font-bold text-gradient">Rp {Number(payment.amount || 0).toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4 text-white/60">{payment.method}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                                  <FaEye className="w-4 h-4 text-white/60" />
                                </button>
                                {payment.status === 'pending' && (
                                  <button onClick={() => handleConfirmPayment(payment.id)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors">
                                    Confirm
                                  </button>
                                )}
                                {payment.status === 'completed' && (
                                  <button onClick={() => handleRefundPayment(payment)} className="px-3 py-1 bg-red-500/15 text-red-300 rounded-lg text-xs hover:bg-red-500/25 transition-colors">
                                    Refund
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Reports</h2>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass rounded-xl p-4"><p className="text-sm text-white/50">Total pengguna</p><p className="mt-1 text-xl font-bold">{Number(reports?.totalUsers || 0).toLocaleString('id-ID')}</p></div>
                <div className="glass rounded-xl p-4"><p className="text-sm text-white/50">Organizer</p><p className="mt-1 text-xl font-bold">{Number(reports?.totalOrganizers || 0).toLocaleString('id-ID')}</p></div>
                <div className="glass rounded-xl p-4"><p className="text-sm text-white/50">Konser</p><p className="mt-1 text-xl font-bold">{Number(reports?.totalConcerts || 0).toLocaleString('id-ID')}</p></div>
                <div className="glass rounded-xl p-4"><p className="text-sm text-white/50">Pendapatan selesai</p><p className="mt-1 text-xl font-bold text-primary">Rp {Number(reports?.totalRevenue || 0).toLocaleString('id-ID')}</p></div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:max-w-xl">
                <div className="glass p-6 rounded-2xl hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <FaFileAlt className="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold">Sales & Payment Report</h3>
                      <p className="text-sm text-white/60">Daftar transaksi, status, dan nilai pembayaran</p>
                    </div>
                  </div>
                  <button disabled={Boolean(exportingReport)} onClick={downloadSalesReport} className="w-full btn-primary text-sm justify-center disabled:opacity-50">
                    <FaDownload className="w-4 h-4" />
                    {exportingReport === 'payments' ? 'Menyiapkan...' : 'Unduh CSV'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">Monthly Revenue</h3>
                  <div className="space-y-3">
                    {analytics?.monthlyRevenue?.map((item) => (
                      <div key={item.month}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/60">{item.month}</span>
                          <span className="text-white/80">Rp {parseInt(item.total).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            style={{ width: `${Math.min((parseInt(item.total) / 10000000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">User Growth</h3>
                  <div className="space-y-3">
                    {analytics?.userGrowth?.map((item) => (
                      <div key={item.month}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/60">{item.month}</span>
                          <span className="text-white/80">{item.count}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                            style={{ width: `${Math.min((parseInt(item.count) / 500) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass p-6 rounded-2xl md:col-span-2">
                  <h3 className="font-bold mb-4">Konser Terlaris</h3>
                  <div className="space-y-3">
                    {analytics?.topConcerts?.length ? analytics.topConcerts.map((concert) => (
                      <div key={concert.id} className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="truncate text-white/80">{concert.name}</span>
                        <span className="shrink-0 text-sm text-primary">{Number(concert.ticketCount || 0).toLocaleString('id-ID')} tiket</span>
                      </div>
                    )) : <p className="text-sm text-white/50">Belum ada data penjualan konser.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">System Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Site Name</label>
                      <input 
                        type="text" 
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleSettingChange}
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Site Description</label>
                      <input 
                        type="text" 
                        name="siteDescription"
                        value={settings.siteDescription}
                        onChange={handleSettingChange}
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                      <select 
                        name="currency"
                        value={settings.currency}
                        onChange={handleSettingChange}
                        className="input-field"
                      >
                        <option value="IDR">Indonesian Rupiah (Rp)</option>
                        <option value="USD">US Dollar ($)</option>
                      </select>
                    </div>
                    <button onClick={handleSaveSettings} className="btn-primary">
                      Save Settings
                    </button>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                      <div>
                        <h4 className="font-medium">Email Verification</h4>
                        <p className="text-sm text-white/60">Require email verification for new users</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="emailVerification"
                          checked={settings.emailVerification}
                          onChange={handleSettingChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-all"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-white/60">Enable 2FA for admin accounts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="twoFactorAuth"
                          checked={settings.twoFactorAuth}
                          onChange={handleSettingChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-all"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                      <div>
                        <h4 className="font-medium">Maintenance Mode</h4>
                        <p className="text-sm text-white/60">Put the platform in maintenance mode</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="maintenanceMode"
                          checked={settings.maintenanceMode}
                          onChange={handleSettingChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}