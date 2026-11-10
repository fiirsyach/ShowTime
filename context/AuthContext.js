'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

if (API_URL.includes('ngrok')) {
  axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 detik timeout
});

// Interceptor untuk request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor untuk response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network error
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - Backend tidak meresponse');
    } else if (error.message === 'Network Error') {
      console.error('❌ Network Error - Backend tidak berjalan atau URL salah');
      console.error('   Pastikan backend berjalan di:', API_URL);
    } else {
      console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistConcertIds, setWishlistConcertIds] = useState([]);
  const [wishlistBusyConcertIds, setWishlistBusyConcertIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Jika tidak ada token, langsung set loading false
    if (!token) {
      setLoading(false);
      return;
    }
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      setWishlistConcertIds([]);
      setWishlistLoading(false);
      return;
    }

    let cancelled = false;
    setWishlistLoading(true);
    const loadWishlist = async () => {
      try {
        const response = await api.get('/customer/wishlist');
        const ids = (response.data?.data || [])
          .map((item) => Number(item.concertId ?? item.concert?.id))
          .filter((id) => Number.isInteger(id) && id > 0);
        if (!cancelled) setWishlistConcertIds(ids);
      } catch (error) {
        console.error('Failed to load wishlist state:', error);
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    };

    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const updateWishlist = async (concertId, shouldSave) => {
    const id = Number(concertId);
    if (!user || user.role !== 'customer' || !Number.isInteger(id) || id <= 0) return false;
    if (wishlistBusyConcertIds.includes(id)) return false;

    setWishlistBusyConcertIds((current) => [...current, id]);

    try {
      if (shouldSave) {
        await api.post(`/customer/favorites/${id}`);
        setWishlistConcertIds((current) => current.includes(id) ? current : [...current, id]);
        toast.success('Ditambahkan ke wishlist');
      } else {
        await api.delete(`/customer/favorites/${id}`);
        setWishlistConcertIds((current) => current.filter((savedId) => savedId !== id));
        toast.success('Dihapus dari wishlist');
      }
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah wishlist');
      return false;
    } finally {
      setWishlistBusyConcertIds((current) => current.filter((busyId) => busyId !== id));
    }
  };

  const toggleWishlist = (concertId) => {
    const id = Number(concertId);
    return updateWishlist(id, !wishlistConcertIds.includes(id));
  };

  const removeWishlist = (concertId) => updateWishlist(concertId, false);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data && response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error.message);
      
      // Jika network error, jangan hapus token, tapi coba lagi nanti
      if (error.message === 'Network Error') {
        // Jangan hapus token, biarkan user tetap login jika sudah
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      let endpoint = '/auth/register/customer';
      if (userData.role === 'organizer') {
        endpoint = '/auth/register/organizer';
      }

      const response = await api.post(endpoint, userData);
      const { token, user } = response.data;

      if (userData.role === 'organizer') {
        toast.success('Pendaftaran berhasil. Akun menunggu verifikasi admin.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return { success: true };
      }

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      setUser(user);
      
      toast.success('Akun berhasil dibuat!');
      
      let path = '/dashboard';
      if (user.role === 'organizer') path = '/organizer/dashboard';
      else if (user.role === 'admin') path = '/admin/dashboard';
      else if (user.role === 'super_admin') path = '/super-admin/dashboard';
      
      setTimeout(() => {
        window.location.href = path;
      }, 1000);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Register error:', error);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Login failed');
      }

      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      setUser(user);
      
      toast.success(`Welcome back, ${user.name}!`);
      
      let path = '/dashboard';
      if (user.role === 'organizer') path = '/organizer/dashboard';
      else if (user.role === 'admin') path = '/admin/dashboard';
      else if (user.role === 'super_admin') path = '/super-admin/dashboard';
      
      setTimeout(() => {
        window.location.href = path;
      }, 500);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to request a password reset');
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unable to request a password reset';
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (resetToken, newPassword, email) => {
    try {
      const body = email
        ? { email, otp: resetToken, newPassword }
        : { resetToken, newPassword };
      const response = await api.post('/auth/reset-password', body);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to reset your password');
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unable to reset your password';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWishlistConcertIds([]);
    toast.success('Logged out');
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    register,
    login,
    forgotPassword,
    resetPassword,
    logout,
    wishlistConcertIds,
    wishlistBusyConcertIds,
    wishlistLoading,
    toggleWishlist,
    removeWishlist,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};