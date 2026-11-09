// src/app/organizer/dashboard/page.js
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaMusic, 
  FaTicketAlt, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCalendar,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaImage,
  FaTag,
  FaGift,
  FaDownload,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaBuilding,
  FaUpload,
  FaPhotoVideo,
  FaQrcode
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getMediaUrl } from '../../../../lib/media-url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
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

export default function OrganizerDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [concerts, setConcerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);

  // ==================== TICKET STATE ====================
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    category: '',
    price: '',
    quota: '',
    concertId: ''
  });

  // ==================== GALLERY STATE ====================
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    concertId: '',  // Default empty string
    caption: '',
    type: 'photo',
    image: null
  });

  const [uploadingGallery, setUploadingGallery] = useState(false);

  // ==================== SEAT STATE ====================
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [selectedSeatConcert, setSelectedSeatConcert] = useState('');
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [seatForm, setSeatForm] = useState({
    concertId: '',
    sectionId: '',
    sectionName: '',
    row: '',
    number: '',
    category: 'regular',
    price: '',
    status: 'available'
  });

  // State untuk form concert
  const [showModal, setShowModal] = useState(false);
  const [editingConcert, setEditingConcert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venueId: '',
    venueName: '',
    venueType: '',
    venueCity: '',
    venueAddress: '',
    price: '',
    totalTickets: '',
    categoryId: '',
    rules: '',
    youtubeTrailer: '',
    startSale: '',
    endSale: '',
    isFeatured: false,
    isFlashSale: false,
    flashSalePrice: '',
    flashSaleEnd: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // ==================== USE EFFECT ====================
  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (requestedTab === 'profile') setActiveTab('profile');
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
    }
    if (user && user.role === 'organizer') {
      fetchAllData();
      fetchVenues();
      fetchTickets();
      fetchGallery();
      fetchSeats();
    }
  }, [user, loading, router]);

  // ==================== FETCH FUNCTIONS ====================
  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        fetchDashboard(),
        fetchConcerts(),
        fetchOrders(),
        fetchPromos()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/organizer/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchConcerts = async () => {
    try {
      const response = await api.get('/organizer/concerts');
      if (response.data.success) {
        setConcerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast.error('Gagal memuat konser');
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      if (response.data.success) {
        setVenues(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/organizer/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPromos = async () => {
    try {
      const response = await api.get('/organizer/promos');
      if (response.data.success) {
        setPromos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  };

  // ==================== TICKET FUNCTIONS ====================
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const url = selectedConcert 
        ? `/organizer/tickets?concertId=${selectedConcert}` 
        : '/organizer/tickets';
      const response = await api.get(url);
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Gagal memuat tiket');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...ticketForm,
        price: parseFloat(ticketForm.price),
        quota: parseInt(ticketForm.quota)
      };

      let response;
      if (editingTicket) {
        response = await api.put(`/organizer/tickets/${editingTicket.id}`, payload);
      } else {
        response = await api.post('/organizer/tickets', payload);
      }

      if (response.data.success) {
        toast.success(editingTicket ? 'Tiket berhasil diupdate!' : 'Tiket berhasil dibuat!');
        setShowTicketModal(false);
        setEditingTicket(null);
        setTicketForm({ category: '', price: '', quota: '', concertId: '' });
        fetchTickets();
        fetchConcerts();
        fetchDashboard();
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan tiket');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket ini?')) return;
    try {
      await api.delete(`/organizer/tickets/${id}`);
      toast.success('Tiket berhasil dihapus!');
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus tiket');
    }
  };

  // ==================== GALLERY FUNCTIONS ====================
  const fetchGallery = async () => {
    try {
      setLoadingGallery(true);
      const response = await api.get('/organizer/gallery');
      if (response.data.success) {
        setGalleryImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGallerySubmit = async (e) => {
  e.preventDefault();
  
  if (!galleryForm.concertId || galleryForm.concertId === '' || galleryForm.concertId === 'undefined') {
    toast.error('Pilih konser terlebih dahulu');
    return;
  }
  
  if (!galleryForm.image) {
    toast.error('Pilih gambar terlebih dahulu');
    return;
  }

  setUploadingGallery(true);
  try {
    const formData = new FormData();
    formData.append('concertId', galleryForm.concertId);
    formData.append('caption', galleryForm.caption || '');
    formData.append('type', galleryForm.type || 'photo');
    formData.append('image', galleryForm.image);


    const response = await api.post('/organizer/gallery', formData);

    if (response.data.success) {
      toast.success('Gambar berhasil diupload!');
      setShowGalleryModal(false);
      setGalleryForm({ concertId: '', caption: '', type: 'photo', image: null });
      fetchGallery();
    }
  } catch (error) {
    console.error('Error uploading gallery:', error);
    toast.error(error.response?.data?.message || 'Gagal upload gambar');
  } finally {
    setUploadingGallery(false);
  }
};


  const handleDeleteGallery = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;
    try {
      await api.delete(`/organizer/gallery/${id}`);
      toast.success('Gambar berhasil dihapus!');
      fetchGallery();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Gagal menghapus gambar');
    }
  };

  // ==================== SEAT FUNCTIONS ====================
  const fetchSeats = async () => {
    try {
      setLoadingSeats(true);
      const url = selectedSeatConcert 
        ? `/organizer/seats?concertId=${selectedSeatConcert}` 
        : '/organizer/seats';
      const response = await api.get(url);
      if (response.data.success) {
        setSeats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...seatForm,
        number: parseInt(seatForm.number),
        price: parseFloat(seatForm.price)
      };

      let response;
      if (editingTicket) {
        response = await api.put(`/organizer/seats/${editingTicket.id}`, payload);
      } else {
        response = await api.post('/organizer/seats', payload);
      }

      if (response.data.success) {
        toast.success('Kursi berhasil ditambahkan!');
        setShowSeatModal(false);
        setSeatForm({
          concertId: '',
          sectionId: '',
          sectionName: '',
          row: '',
          number: '',
          category: 'regular',
          price: '',
          status: 'available'
        });
        fetchSeats();
      }
    } catch (error) {
      console.error('Error saving seat:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan kursi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSeat = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kursi ini?')) return;
    try {
      await api.delete(`/organizer/seats/${id}`);
      toast.success('Kursi berhasil dihapus!');
      fetchSeats();
    } catch (error) {
      console.error('Error deleting seat:', error);
      toast.error('Gagal menghapus kursi');
    }
  };

  // ==================== CONCERT FUNCTIONS ====================
  const handleVenueSelect = (venueId) => {
    const venue = venues.find(v => v.id === parseInt(venueId));
    setSelectedVenue(venue);
    setFormData({
      ...formData,
      venueId: venueId,
      venueName: venue?.name || '',
      venueType: venue?.type || '',
      venueCity: venue?.city || '',
      venueAddress: venue?.address || '',
      totalTickets: venue?.capacity || formData.totalTickets
    });
  };

  const handleCreateConcert = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Nama konser wajib diisi');
        setFormLoading(false);
        return;
      }
      if (!formData.date) {
        toast.error('Tanggal konser wajib diisi');
        setFormLoading(false);
        return;
      }
      if (!formData.time) {
        toast.error('Waktu konser wajib diisi');
        setFormLoading(false);
        return;
      }
      if (!formData.venueId) {
        toast.error('Venue wajib dipilih');
        setFormLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        date: formData.date,
        time: formData.time,
        venueId: parseInt(formData.venueId),
        venueName: formData.venueName || '',
        venueType: formData.venueType || '',
        city: formData.venueCity || '',
        address: formData.venueAddress || '',
        minPrice: parseFloat(formData.price) || 0,
        maxPrice: parseFloat(formData.price) || 0,
        totalTickets: parseInt(formData.totalTickets) || 0,
        genre: formData.categoryId || '',
        rules: formData.rules || '',
        youtubeTrailer: formData.youtubeTrailer || '',
        startSale: formData.startSale || null,
        endSale: formData.endSale || null,
        isFeatured: formData.isFeatured || false,
        isFlashSale: formData.isFlashSale || false,
        flashSalePrice: formData.flashSalePrice ? parseFloat(formData.flashSalePrice) : null,
        flashSaleEnd: formData.flashSaleEnd || null
      };

      const response = await api.post('/organizer/concerts', payload);
      
      if (response.data.success) {
        toast.success('Konser berhasil dibuat!');
        setShowModal(false);
        resetForm();
        await fetchConcerts();
        await fetchDashboard();
      }
    } catch (error) {
      console.error('Error creating concert:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat konser');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateConcert = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        date: formData.date,
        time: formData.time,
        venueId: formData.venueId ? parseInt(formData.venueId) : null,
        venueName: formData.venueName || '',
        venueType: formData.venueType || '',
        city: formData.venueCity || '',
        address: formData.venueAddress || '',
        minPrice: parseFloat(formData.price) || 0,
        maxPrice: parseFloat(formData.price) || 0,
        totalTickets: parseInt(formData.totalTickets) || 0,
        genre: formData.categoryId || '',
        rules: formData.rules || '',
        youtubeTrailer: formData.youtubeTrailer || '',
        startSale: formData.startSale || null,
        endSale: formData.endSale || null,
        isFeatured: formData.isFeatured || false,
        isFlashSale: formData.isFlashSale || false,
        flashSalePrice: formData.flashSalePrice ? parseFloat(formData.flashSalePrice) : null,
        flashSaleEnd: formData.flashSaleEnd || null
      };

      const response = await api.put(`/organizer/concerts/${editingConcert.id}`, payload);
      
      if (response.data.success) {
        toast.success('Konser berhasil diupdate!');
        setShowModal(false);
        setEditingConcert(null);
        resetForm();
        await fetchConcerts();
        await fetchDashboard();
      }
    } catch (error) {
      console.error('Error updating concert:', error);
      toast.error(error.response?.data?.message || 'Gagal mengupdate konser');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      time: '',
      venueId: '',
      venueName: '',
      venueType: '',
      venueCity: '',
      venueAddress: '',
      price: '',
      totalTickets: '',
      categoryId: '',
      rules: '',
      youtubeTrailer: '',
      startSale: '',
      endSale: '',
      isFeatured: false,
      isFlashSale: false,
      flashSalePrice: '',
      flashSaleEnd: ''
    });
    setSelectedVenue(null);
  };

  const handleDeleteConcert = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini?')) return;
    try {
      await api.delete(`/organizer/concerts/${id}`);
      toast.success('Konser berhasil dihapus!');
      fetchConcerts();
      fetchDashboard();
    } catch (error) {
      console.error('Error deleting concert:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus konser');
    }
  };

  const handlePublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/publish`);
      if (response.data.success) {
        toast.success('Konser berhasil dipublikasikan!');
        fetchConcerts();
        fetchDashboard();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal mempublikasikan konser';
      if (error.response?.data?.message?.includes('already published')) {
        toast.info('Konser ini sudah dipublikasikan sebelumnya.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleUnpublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/unpublish`);
      if (response.data.success) {
        toast.success('Konser berhasil di-unpublish!');
        fetchConcerts();
        fetchDashboard();
      }
    } catch (error) {
      console.error('Error unpublishing concert:', error);
      toast.error(error.response?.data?.message || 'Gagal meng-unpublish konser');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'published': { color: 'text-green-400 bg-green-400/10', label: 'Published' },
      'on_sale': { color: 'text-green-400 bg-green-400/10', label: 'On Sale' },
      'paid': { color: 'text-green-400 bg-green-400/10', label: 'Paid' },
      'pending': { color: 'text-yellow-400 bg-yellow-400/10', label: 'Pending' },
      'draft': { color: 'text-gray-400 bg-gray-400/10', label: 'Draft' },
      'rejected': { color: 'text-red-400 bg-red-400/10', label: 'Rejected' },
      'approved': { color: 'text-blue-400 bg-blue-400/10', label: 'Approved' },
      'sold_out': { color: 'text-red-400 bg-red-400/10', label: 'Sold Out' },
      'finished': { color: 'text-gray-400 bg-gray-400/10', label: 'Finished' },
      'cancelled': { color: 'text-red-400 bg-red-400/10', label: 'Cancelled' }
    };
    return statusMap[status] || { color: 'text-white/40 bg-white/5', label: status };
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-secondary animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  const stats = dashboardData?.stats || {
    totalConcerts: concerts.length,
    totalOrders: orders.length,
    revenue: 0,
    soldTickets: 0,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    availableTickets: 0
  };

  // ==================== RENDER DASHBOARD ====================
  const renderDashboard = () => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/organizer/concerts" className="glass p-6 rounded-2xl hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Active Concerts</p>
              <p className="text-2xl font-bold mt-1">{stats.activeConcerts ?? stats.totalConcerts}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <FaMusic className="text-primary text-xl" />
            </div>
          </div>
        </Link>

        <Link href="/organizer/orders" className="glass p-6 rounded-2xl hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <FaTicketAlt className="text-secondary text-xl" />
            </div>
          </div>
        </Link>

        <Link href="/organizer/revenue" className="glass p-6 rounded-2xl hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-gradient mt-1">
                Rp {stats.revenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <FaMoneyBillWave className="text-green-500 text-xl" />
            </div>
          </div>
        </Link>

        <Link href="/organizer/analytics" className="glass p-6 rounded-2xl hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Tickets Sold</p>
              <p className="text-2xl font-bold mt-1">{stats.soldTickets.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FaUsers className="text-purple-500 text-xl" />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">📊 Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 glass rounded-xl">
              <span className="text-white/60">Pending Orders</span>
              <span className="font-bold text-yellow-400">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 glass rounded-xl">
              <span className="text-white/60">Available Tickets</span>
              <span className="font-bold text-green-400">{stats.availableTickets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 glass rounded-xl">
              <span className="text-white/60">Active Promos</span>
              <span className="font-bold text-primary">{promos.length}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              href="/organizer/concerts/create"
              className="w-full flex items-center justify-between p-4 glass rounded-xl hover:border-primary/30 transition-all"
            >
              <span className="flex items-center gap-3">
                <FaPlus className="text-primary" />
                <span>Create New Concert</span>
              </span>
              <span className="text-primary">→</span>
            </Link>
            
            <Link 
              href="/organizer/tickets"
              className="w-full flex items-center justify-between p-4 glass rounded-xl hover:border-primary/30 transition-all"
            >
              <span className="flex items-center gap-3">
                <FaTicketAlt className="text-secondary" />
                <span>Manage Tickets</span>
              </span>
              <span className="text-secondary">→</span>
            </Link>

            <Link
              href="/organizer/scanner"
              className="w-full flex items-center justify-between p-4 glass rounded-xl hover:border-green-400/30 transition-all"
            >
              <span className="flex items-center gap-3">
                <FaQrcode className="text-green-300" />
                <span>Scan Ticket Check-in</span>
              </span>
              <span className="text-green-300">→</span>
            </Link>
            
            <Link 
              href="/organizer/promos"
              className="w-full flex items-center justify-between p-4 glass rounded-xl hover:border-primary/30 transition-all"
            >
              <span className="flex items-center gap-3">
                <FaGift className="text-purple-500" />
                <span>Create Promo</span>
              </span>
              <span className="text-purple-500">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER CONCERTS ====================
  const renderConcerts = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Concerts</h2>
        <Link 
          href="/organizer/concerts/create"
          className="btn-primary text-sm py-2"
        >
          <FaPlus className="w-4 h-4" />
          Create Concert
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-white/40 text-sm">
                <th className="px-6 py-3">Concert</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Venue</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {concerts.length > 0 ? (
                concerts.map((concert) => {
                  const statusBadge = getStatusBadge(concert.status);
                  return (
                    <tr key={concert.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{concert.name || 'Unnamed Concert'}</p>
                          <p className="text-xs text-white/40">{concert.genre || 'General'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {concert.date ? format(new Date(concert.date), 'd MMM yyyy', { locale: id }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {concert.venueName || concert.venue || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gradient">
                        Rp {concert.minPrice?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                            <FaEye className="w-4 h-4 text-white/60" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingConcert(concert);
                              setFormData({
                                name: concert.name || '',
                                description: concert.description || '',
                                date: concert.date ? concert.date.split('T')[0] : '',
                                time: concert.time || '',
                                venueId: concert.venueId || '',
                                venueName: concert.venueName || concert.venue || '',
                                venueType: concert.venueType || '',
                                venueCity: concert.city || '',
                                venueAddress: concert.address || '',
                                price: concert.minPrice || '',
                                totalTickets: concert.totalTickets || '',
                                categoryId: concert.categoryId || '',
                                rules: concert.rules || '',
                                youtubeTrailer: concert.youtubeTrailer || '',
                                startSale: concert.startSale || '',
                                endSale: concert.endSale || '',
                                isFeatured: concert.isFeatured || false,
                                isFlashSale: concert.isFlashSale || false,
                                flashSalePrice: concert.flashSalePrice || '',
                                flashSaleEnd: concert.flashSaleEnd || ''
                              });
                              if (concert.venueId) {
                                const venue = venues.find(v => v.id === concert.venueId);
                                setSelectedVenue(venue);
                              }
                              setShowModal(true);
                            }}
                            className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <FaEdit className="w-4 h-4 text-primary" />
                          </button>
                          {['draft', 'pending', 'approved'].includes(concert.status) && (
                            <button 
                              onClick={() => handleDeleteConcert(concert.id)}
                              title="Hapus konser"
                              className="p-2 glass rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <FaTrash className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                          {concert.status === 'approved' && (
                            <button 
                              onClick={() => handlePublishConcert(concert.id)}
                              className="p-2 glass rounded-lg hover:bg-green-500/10 transition-colors"
                              title="Publish Concert"
                            >
                              <FaCheckCircle className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          {(concert.status === 'published' || concert.status === 'on_sale') && (
                            <button 
                              onClick={() => handleUnpublishConcert(concert.id)}
                              className="p-2 glass rounded-lg hover:bg-yellow-500/10 transition-colors"
                              title="Unpublish Concert"
                            >
                              <FaTimesCircle className="w-4 h-4 text-yellow-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-white/40">
                    Belum ada konser. Buat konser pertama Anda!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER TICKET MANAGEMENT ====================
  const renderTicketManagement = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Ticket Management</h2>
        <button 
          onClick={() => {
            setEditingTicket(null);
            setTicketForm({ category: '', price: '', quota: '', concertId: concerts[0]?.id || '' });
            setShowTicketModal(true);
          }}
          className="btn-primary text-sm py-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Ticket Category
        </button>
      </div>

      {/* Filter by Concert */}
      <div className="mb-4">
        <select
          value={selectedConcert}
          onChange={(e) => {
            setSelectedConcert(e.target.value);
            fetchTickets();
          }}
          className="input-field py-2 text-sm w-64"
        >
          <option value="">All Concerts</option>
          {concerts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Tickets Grid */}
      {loadingTickets ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="glass p-6 rounded-2xl hover:border-secondary/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary">{ticket.category}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.sold < ticket.quota ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {ticket.quota > 0 ? Math.round((ticket.sold / ticket.quota) * 100) : 0}% sold
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Price</span>
                  <span className="font-bold text-gradient">Rp {ticket.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Quota</span>
                  <span>{ticket.quota.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Sold</span>
                  <span className="text-green-400">{ticket.sold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Available</span>
                  <span className="text-blue-400">{ticket.available.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Concert</span>
                  <span className="text-white/80 truncate max-w-[120px]">{ticket.concert?.name || '-'}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full mt-4">
                <div 
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                  style={{ width: `${ticket.quota > 0 ? (ticket.sold / ticket.quota) * 100 : 0}%` }}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => {
                    setEditingTicket(ticket);
                    setTicketForm({
                      category: ticket.category,
                      price: ticket.price,
                      quota: ticket.quota,
                      concertId: ticket.concertId
                    });
                    setShowTicketModal(true);
                  }}
                  className="flex-1 glass py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit className="w-4 h-4 text-primary" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteTicket(ticket.id)}
                  className="flex-1 glass py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl text-center">
          <FaTicketAlt className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Belum Ada Kategori Tiket</h3>
          <p className="text-white/60">Tambahkan kategori tiket untuk konser Anda.</p>
        </div>
      )}

      {/* Modal Create/Edit Ticket */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingTicket ? 'Edit Ticket Category' : 'Add Ticket Category'}
              </h2>
              <button onClick={() => setShowTicketModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Festival">Festival</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price (Rp) *</label>
                <input
                  type="number"
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({...ticketForm, price: e.target.value})}
                  className="input-field"
                  placeholder="Harga tiket"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Quota *</label>
                <input
                  type="number"
                  value={ticketForm.quota}
                  onChange={(e) => setTicketForm({...ticketForm, quota: e.target.value})}
                  className="input-field"
                  placeholder="Jumlah tiket"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Concert *</label>
                <select
                  value={ticketForm.concertId}
                  onChange={(e) => setTicketForm({...ticketForm, concertId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Pilih Konser</option>
                  {concerts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTicketModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 btn-primary justify-center">
                  {formLoading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingTicket ? 'Update Ticket' : 'Add Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== RENDER SEAT LAYOUT ====================
  const renderSeatLayout = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Seat Layout</h2>
        <button 
          onClick={() => {
            setShowSeatModal(true);
            setSeatForm({ ...seatForm, concertId: concerts[0]?.id || '' });
          }}
          className="btn-primary text-sm py-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Seat
        </button>
      </div>

      {/* Filter by Concert */}
      <div className="mb-4">
        <select
          value={selectedSeatConcert}
          onChange={(e) => {
            setSelectedSeatConcert(e.target.value);
            fetchSeats();
          }}
          className="input-field py-2 text-sm w-64"
        >
          <option value="">All Concerts</option>
          {concerts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Seats Grid */}
      {loadingSeats ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : seats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seats.map((seat) => (
            <div key={seat.id} className="glass p-4 rounded-xl hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Seat {seat.row}{seat.number}</h4>
                  <p className="text-sm text-white/60">{seat.sectionName || 'Default'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  seat.status === 'available' ? 'bg-green-500/20 text-green-400' :
                  seat.status === 'booked' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {seat.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>
                  <span className="text-white/60">Category</span>
                  <p className="font-medium">{seat.category}</p>
                </div>
                <div>
                  <span className="text-white/60">Price</span>
                  <p className="font-bold text-gradient">Rp {seat.price?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 glass py-1 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                  <FaEdit className="w-3 h-3 text-primary" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteSeat(seat.id)}
                  className="flex-1 glass py-1 rounded-lg text-xs hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-1"
                >
                  <FaTrash className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl text-center">
          <FaUsers className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Belum Ada Kursi</h3>
          <p className="text-white/60">Tambahkan kursi untuk konser Anda.</p>
        </div>
      )}

      {/* Modal Add Seat */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Seat</h2>
              <button onClick={() => setShowSeatModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSeatSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Concert *</label>
                <select
                  value={seatForm.concertId}
                  onChange={(e) => setSeatForm({...seatForm, concertId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Pilih Konser</option>
                  {concerts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Row *</label>
                  <input
                    type="text"
                    value={seatForm.row}
                    onChange={(e) => setSeatForm({...seatForm, row: e.target.value.toUpperCase()})}
                    className="input-field"
                    placeholder="A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Number *</label>
                  <input
                    type="number"
                    value={seatForm.number}
                    onChange={(e) => setSeatForm({...seatForm, number: e.target.value})}
                    className="input-field"
                    placeholder="1"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Section Name</label>
                <input
                  type="text"
                  value={seatForm.sectionName}
                  onChange={(e) => setSeatForm({...seatForm, sectionName: e.target.value})}
                  className="input-field"
                  placeholder="VIP, Regular, etc"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
                  <select
                    value={seatForm.category}
                    onChange={(e) => setSeatForm({...seatForm, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                    <option value="vvip">VVIP</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Price (Rp) *</label>
                  <input
                    type="number"
                    value={seatForm.price}
                    onChange={(e) => setSeatForm({...seatForm, price: e.target.value})}
                    className="input-field"
                    placeholder="150000"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <select
                  value={seatForm.status}
                  onChange={(e) => setSeatForm({...seatForm, status: e.target.value})}
                  className="input-field"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="reserved">Reserved</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowSeatModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 btn-primary justify-center">
                  {formLoading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Add Seat'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== RENDER GALLERY ====================
  const renderGallery = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gallery</h2>
        <button 
          onClick={() => setShowGalleryModal(true)}
          className="btn-primary text-sm py-2"
        >
          <FaUpload className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      {/* Gallery Grid */}
      {loadingGallery ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : galleryImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image) => (
            <div key={image.id} className="glass rounded-xl overflow-hidden group">
              <div className="relative aspect-square bg-gradient-to-br from-primary/30 to-secondary/30">
                <Image
                  src={getMediaUrl(image.image)}
                  alt={image.caption || `${image.type} ${image.concert?.name || 'konser'}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{image.caption || 'No caption'}</p>
                <p className="text-xs text-white/40 capitalize">{image.type}</p>
                <p className="text-xs text-white/40">{image.concert?.name || 'No concert'}</p>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 glass py-1 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                    <FaEye className="w-3 h-3" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDeleteGallery(image.id)}
                    className="flex-1 glass py-1 rounded-lg text-xs hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-1"
                  >
                    <FaTrash className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl text-center">
          <FaImage className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Belum Ada Gambar</h3>
          <p className="text-white/60">Upload poster, banner, atau galeri konser Anda.</p>
        </div>
      )}

      {/* Modal Upload Gallery */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upload Image</h2>
              <button onClick={() => setShowGalleryModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Concert <span className="text-red-400">*</span>
                </label>
                <select
                  value={galleryForm.concertId}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log("📝 Selected concert value:", value);
                    console.log("📝 Selected concert type:", typeof value);
                    setGalleryForm({...galleryForm, concertId: value});
                  }}
                  className={`input-field ${!galleryForm.concertId ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">-- Pilih Konser --</option>
                  {concerts && concerts.length > 0 ? (
                    concerts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Belum ada konser</option>
                  )}
                </select>
                {!galleryForm.concertId && (
                  <p className="text-red-400 text-xs mt-1">⚠️ Silakan pilih konser terlebih dahulu</p>
                )}
                {/* DEBUG: Tampilkan nilai saat ini */}
                <p className="text-xs text-white/40 mt-1">Current value: {galleryForm.concertId || '(empty)'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Image File <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      console.log("📸 Selected file:", file.name, file.type, file.size);
                      setGalleryForm({...galleryForm, image: file});
                    }
                  }}
                  className="input-field py-2"
                  required
                />
                {!galleryForm.image && (
                  <p className="text-red-400 text-xs mt-1">⚠️ Silakan pilih gambar</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Caption</label>
                <input
                  type="text"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({...galleryForm, caption: e.target.value})}
                  className="input-field"
                  placeholder="Deskripsi gambar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Type</label>
                <select
                  value={galleryForm.type}
                  onChange={(e) => setGalleryForm({...galleryForm, type: e.target.value})}
                  className="input-field"
                >
                  <option value="photo">Photo</option>
                  <option value="poster">Poster</option>
                  <option value="banner">Banner</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploadingGallery || !galleryForm.concertId || !galleryForm.image} 
                  className={`flex-1 btn-primary justify-center ${(!galleryForm.concertId || !galleryForm.image) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadingGallery ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Upload Image'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== RENDER ORDERS ====================
  const renderOrders = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-white/40 text-sm">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Tickets</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{order.user?.name || order.customerName || '-'}</td>
                    <td className="px-6 py-4 text-white/60">{order.tickets?.length || 0}</td>
                    <td className="px-6 py-4 font-bold text-gradient">Rp {order.totalAmount?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy', { locale: id }) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/organizer/orders/${order.id}`} className="p-2 glass rounded-lg hover:bg-white/10 transition-colors inline-block">
                        <FaEye className="w-4 h-4 text-white/60" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER REVENUE ====================
  const renderRevenue = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Revenue</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass p-6 rounded-2xl">
          <p className="text-white/60 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-gradient">Rp {stats.revenue.toLocaleString()}</p>
        </div>
        <div className="glass p-6 rounded-2xl">
          <p className="text-white/60 text-sm">This Month</p>
          <p className="text-3xl font-bold text-gradient">Rp {(stats.revenue * 0.4).toLocaleString()}</p>
        </div>
        <div className="glass p-6 rounded-2xl">
          <p className="text-white/60 text-sm">Growth</p>
          <p className="text-3xl font-bold text-green-400">+12.5%</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl">
        <h3 className="font-bold mb-4">Revenue Chart</h3>
        <div className="h-48 flex items-end gap-4">
          {dashboardData?.monthlyRevenue?.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all"
                style={{ height: `${Math.min((parseInt(item.total) / 10000000) * 100, 100)}%` }}
              />
              <span className="text-xs text-white/40">{item.month?.substring(5) || index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== RENDER PROFILE ====================
  const renderProfile = () => (
    <div className="glass p-8 rounded-2xl max-w-2xl">
      <h2 className="text-2xl font-bold mb-3">Organizer Profile</h2>
      <p className="text-white/60 mb-6">Kelola identitas penyelenggara dan informasi kontak melalui halaman profil.</p>
      <Link href="/organizer/profile" className="btn-primary inline-flex">Buka Pengaturan Profil</Link>
    </div>
  );

  // ==================== RENDER PROMOS ====================
  const renderPromos = () => (
    <div className="glass max-w-2xl rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">Promo Management</h2>
      <p className="mb-6 text-white/60">Buat kode voucher, atur batas penggunaan, dan kelola periode promosi tiket.</p>
      <Link href="/organizer/promos" className="btn-primary inline-flex">Kelola Promo</Link>
    </div>
  );

  // ==================== MODAL CREATE/EDIT CONCERT ====================
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass p-8 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {editingConcert ? 'Edit Concert' : 'Create New Concert'}
            </h2>
            <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
              ✕
            </button>
          </div>

          <form onSubmit={editingConcert ? handleUpdateConcert : handleCreateConcert} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Concert Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Enter concert name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Pop, Rock, Jazz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="3"
                placeholder="Describe your concert"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time || ''}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/10 p-4">
              <p className="col-span-2 text-sm font-medium">Ticket sales period</p>
              <label className="text-sm text-white/70">
                Mulai penjualan
                <input
                  type="datetime-local"
                  value={formData.startSale || ''}
                  onChange={(e) => setFormData({ ...formData, startSale: e.target.value })}
                  className="input-field mt-2"
                />
              </label>
              <label className="text-sm text-white/70">
                Akhir penjualan
                <input
                  type="datetime-local"
                  value={formData.endSale || ''}
                  min={formData.startSale || undefined}
                  onChange={(e) => setFormData({ ...formData, endSale: e.target.value })}
                  className="input-field mt-2"
                />
              </label>
            </div>

            {/* VENUE SELECTION */}
            <div className="border border-primary/20 rounded-xl p-4 bg-primary/5">
              <label className="block text-sm font-medium text-white/80 mb-2">
                🏟️ Select Venue <span className="text-red-400">*</span>
                <span className="text-xs text-white/40 block">
                  Pilih venue untuk menentukan layout kursi konser
                </span>
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => handleVenueSelect(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Pilih Venue --</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} - {venue.city} ({venue.type})
                  </option>
                ))}
              </select>

              {/* Venue Preview */}
              {selectedVenue && (
                <div className="mt-4 glass p-4 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">
                      {selectedVenue.type === 'stadium' && '🏟️'}
                      {selectedVenue.type === 'hall' && '🏛️'}
                      {selectedVenue.type === 'outdoor' && '🌳'}
                      {selectedVenue.type === 'arena' && '🏟️'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{selectedVenue.name}</p>
                      <p className="text-sm text-white/60">{selectedVenue.city}</p>
                      <p className="text-sm text-white/40">{selectedVenue.address}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-0.5 glass rounded-full text-xs">
                          Type: {selectedVenue.type}
                        </span>
                        <span className="px-2 py-0.5 glass rounded-full text-xs">
                          Capacity: {selectedVenue.capacity}
                        </span>
                        <span className="px-2 py-0.5 glass rounded-full text-xs">
                          Stage: {selectedVenue.stageType || 'Front'}
                        </span>
                      </div>
                      <div className="mt-2 p-2 bg-primary/10 rounded-lg">
                        <p className="text-xs text-primary">
                          ✅ Seat layout akan otomatis mengikuti tipe venue
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price & Tickets */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Price (Min)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="input-field"
                  placeholder="Minimum price"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Total Tickets
                  <span className="text-xs text-white/40 block">
                    Default: {selectedVenue?.capacity || 0}
                  </span>
                </label>
                <input
                  type="number"
                  name="totalTickets"
                  value={formData.totalTickets || ''}
                  onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
                  className="input-field"
                  placeholder="Total tickets"
                  min="1"
                  max={selectedVenue?.capacity || 10000}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Rules</label>
              <textarea
                name="rules"
                value={formData.rules || ''}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                className="input-field"
                rows="2"
                placeholder="Concert rules and regulations"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">YouTube Trailer</label>
                <input
                  type="url"
                  name="youtubeTrailer"
                  value={formData.youtubeTrailer || ''}
                  onChange={(e) => setFormData({...formData, youtubeTrailer: e.target.value})}
                  className="input-field"
                  placeholder="YouTube video URL"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded border-white/20 bg-dark/50"
                  />
                  ⭐ Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={formData.isFlashSale || false}
                    onChange={(e) => setFormData({...formData, isFlashSale: e.target.checked})}
                    className="rounded border-white/20 bg-dark/50"
                  />
                  ⚡ Flash Sale
                </label>
              </div>
            </div>

            {/* Flash Sale Details */}
            {formData.isFlashSale && (
              <div className="grid grid-cols-2 gap-4 border border-secondary/20 rounded-xl p-4 bg-secondary/5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Flash Sale Price</label>
                  <input
                    type="number"
                    name="flashSalePrice"
                    value={formData.flashSalePrice || ''}
                    onChange={(e) => setFormData({...formData, flashSalePrice: e.target.value})}
                    className="input-field"
                    placeholder="Discounted price"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Flash Sale End</label>
                  <input
                    type="datetime-local"
                    name="flashSaleEnd"
                    value={formData.flashSaleEnd || ''}
                    onChange={(e) => setFormData({...formData, flashSaleEnd: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 btn-primary justify-center">
                {formLoading ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    {editingConcert ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  editingConcert ? 'Update Concert' : 'Create Concert'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ==================== RENDER CONTENT ====================
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'concerts':
        return renderConcerts();
      case 'tickets':
        return renderTicketManagement();
      case 'seats':
        return renderSeatLayout();
      case 'gallery':
        return renderGallery();
      case 'promos':
        return renderPromos();
      case 'orders':
        return renderOrders();
      case 'revenue':
        return renderRevenue();
      case 'analytics':
        return <div className="text-center py-8 text-white/60">Analytics - <Link href="/organizer/analytics" className="text-primary hover:underline">Go to Analytics</Link></div>;
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/5 p-6 z-50 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gradient">ConcertHub</h2>
          <p className="text-xs text-white/40 mt-1">Organizer Dashboard</p>
          <p className="text-xs text-secondary mt-1">🏢 {user?.name}</p>
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
            onClick={() => setActiveTab('concerts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'concerts' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaMusic className="w-5 h-5" />
            <span className="text-sm font-medium">Manage Concerts</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'tickets' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaTicketAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Ticket Management</span>
          </button>
          <Link
            href="/organizer/scanner"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white/5 text-white/60 hover:text-white"
          >
            <FaQrcode className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium">Scan Ticket Check-in</span>
          </Link>
          <button
            onClick={() => setActiveTab('seats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'seats' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaUsers className="w-5 h-5" />
            <span className="text-sm font-medium">Seat Layout</span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'gallery' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaImage className="w-5 h-5" />
            <span className="text-sm font-medium">Gallery</span>
          </button>
          <button
            onClick={() => router.push('/organizer/promos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'promos' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaGift className="w-5 h-5" />
            <span className="text-sm font-medium">Promo</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaTicketAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'revenue' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaMoneyBillWave className="w-5 h-5" />
            <span className="text-sm font-medium">Revenue</span>
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
            onClick={() => router.push('/organizer/profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'profile' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <FaUser className="w-5 h-5" />
            <span className="text-sm font-medium">Profile</span>
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
              <p className="text-white/60 mt-1">Organizer Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 glass rounded-full text-xs text-secondary">
                🏢 {user?.name}
              </span>
              <button 
                onClick={fetchAllData}
                className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <FaSpinner className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {renderContent()}
          {renderModal()}
        </div>
      </div>
    </div>
  );
}