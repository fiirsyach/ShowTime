'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCamera, FaCheckCircle, FaSpinner, FaTimesCircle, FaUsers } from 'react-icons/fa';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function TicketScannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const scannerRef = useRef(null);
  const cameraLifecycleRef = useRef(Promise.resolve());
  const selectedConcertRef = useRef('');
  const inFlightRef = useRef(false);
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [selectedConcertId, setSelectedConcertId] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && !['organizer', 'admin', 'super_admin'].includes(user.role)) router.push('/dashboard');
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user || !['organizer', 'admin', 'super_admin'].includes(user.role)) return undefined;
    let active = true;
    const loadConcerts = async () => {
      try {
        const response = user.role === 'organizer'
          ? await api.get('/organizer/concerts')
          : await api.get('/concerts?limit=100');
        const rows = response.data?.data || [];
        if (!active) return;
        setConcerts(rows);
        const queryConcertId = new URLSearchParams(window.location.search).get('concertId');
        if (queryConcertId && rows.some((concert) => String(concert.id) === queryConcertId)) {
          selectedConcertRef.current = queryConcertId;
          setSelectedConcertId(queryConcertId);
        }
      } catch (error) {
        console.error('Failed to load concerts for scanner:', error);
        if (active) toast.error(error.response?.data?.message || 'Gagal memuat daftar konser');
      } finally {
        if (active) setLoadingConcerts(false);
      }
    };
    loadConcerts();
    return () => { active = false; };
  }, [loading, user]);

  const loadScans = useCallback(async (concertId) => {
    if (!concertId) return;
    try {
      setLoadingScans(true);
      const response = await api.get('/tickets/scans', { params: { concertId } });
      setScans(response.data?.data?.scans || []);
    } catch (error) {
      console.error('Failed to load check-in history:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat riwayat check-in');
    } finally {
      setLoadingScans(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedConcertId) return;
    const timeoutId = window.setTimeout(() => loadScans(selectedConcertId), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadScans, selectedConcertId]);

  const validateCode = useCallback(async (code) => {
    if (!code || !selectedConcertId || selectedConcertRef.current !== selectedConcertId || inFlightRef.current) return;
    inFlightRef.current = true;
    setChecking(true);
    try {
      const response = await api.post('/tickets/scan', { code, concertId: Number(selectedConcertId) });
      setResult({ success: true, message: response.data.message, data: response.data.data });
      toast.success('Tiket valid');
      await loadScans(selectedConcertId);
    } catch (error) {
      setResult({ success: false, message: error.response?.data?.message || 'QR tidak dapat divalidasi' });
      toast.error(error.response?.data?.message || 'QR tidak valid');
    } finally {
      setChecking(false);
      setManualCode('');
      window.setTimeout(() => { inFlightRef.current = false; }, 1500);
    }
  }, [selectedConcertId, loadScans]);

  useEffect(() => {
    if (loading || !user || !['organizer', 'admin', 'super_admin'].includes(user.role)) return undefined;
    if (!selectedConcertId) return undefined;
    let active = true;
    const stopScanner = async () => {
      const scanner = scannerRef.current;
      if (!scanner) return;
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
      if (scannerRef.current === scanner) scannerRef.current = null;
    };

    cameraLifecycleRef.current = cameraLifecycleRef.current
      .catch((error) => console.error('Previous camera lifecycle failed:', error))
      .then(async () => {
        await stopScanner();
        if (!active) return;

        const { Html5Qrcode } = await import('html5-qrcode');
        if (!active) return;

        const scanner = new Html5Qrcode('ticket-qr-reader');
        scannerRef.current = scanner;
        try {
          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
            (decodedText) => validateCode(decodedText),
            () => {}
          );
          if (!active) {
            await stopScanner();
            return;
          }
          setScannerReady(true);
        } catch (error) {
          console.error('Camera scanner unavailable:', error);
          await stopScanner();
          if (active) setScannerReady(false);
        }
      });

    return () => {
      active = false;
      cameraLifecycleRef.current = cameraLifecycleRef.current
        .catch((error) => console.error('Camera startup failed:', error))
        .then(stopScanner)
        .catch((error) => console.error('Failed to stop previous camera:', error));
    };
  }, [loading, user, selectedConcertId, validateCode]);

  const handleConcertChange = (event) => {
    const concertId = event.target.value;
    selectedConcertRef.current = concertId;
    setScannerReady(false);
    setSelectedConcertId(concertId);
    setResult(null);
    setManualCode('');
    setScans([]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark text-white"><FaSpinner className="h-9 w-9 animate-spin text-primary" /></div>;
  if (!user || !['organizer', 'admin', 'super_admin'].includes(user.role)) return null;

  return (
    <main className="min-h-screen bg-dark px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/organizer/tickets" className="mb-7 inline-flex items-center gap-2 text-white/60 hover:text-white"><FaArrowLeft /> Ticket management</Link>
        <div className="flex items-center gap-3">
          <FaCamera className="text-primary" />
          <div><h1 className="text-3xl font-bold">QR Code Check-In Scanner</h1><p className="mt-1 text-sm text-white/50">Pilih konser terlebih dahulu. QR hanya berlaku untuk konser yang dipilih.</p></div>
        </div>

        <section className="glass mt-7 rounded-xl p-5">
          <label htmlFor="scanner-concert" className="mb-2 block text-sm font-medium text-white/80">Pilih konser yang akan menerima check-in</label>
          <select
            id="scanner-concert"
            value={selectedConcertId}
            onChange={handleConcertChange}
            className="input-field"
            disabled={loadingConcerts || checking}
          >
            <option value="">{loadingConcerts ? 'Memuat konser...' : 'Pilih konser'}</option>
            {concerts.map((concert) => (
              <option key={concert.id} value={concert.id}>{concert.name}</option>
            ))}
          </select>
          {!loadingConcerts && concerts.length === 0 && (
            <p className="mt-2 text-sm text-amber-200">Belum ada konser yang dapat dipilih.</p>
          )}
        </section>

        {selectedConcertId && (
          <>
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
              <section className="glass rounded-xl p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-semibold">Kamera pemindai</h2>
                  {scannerReady && <span className="rounded-full bg-green-400/10 px-2.5 py-1 text-xs text-green-300">Kamera aktif</span>}
                </div>
                <div id="ticket-qr-reader" className="min-h-72 overflow-hidden rounded-lg bg-black" />
                {!scannerReady && <p className="mt-3 text-sm text-white/50">Kamera belum aktif atau izin belum diberikan. Gunakan input kode di samping.</p>}
              </section>
              <section className="glass h-fit rounded-xl p-5">
                <form onSubmit={(event) => { event.preventDefault(); validateCode(manualCode.trim()); }} className="space-y-3">
                  <label className="block text-sm text-white/70">Kode QR
                    <input value={manualCode} onChange={(event) => setManualCode(event.target.value)} className="input-field mt-2" autoComplete="off" />
                  </label>
                  <button disabled={!manualCode.trim() || checking || !selectedConcertId} className="btn-primary w-full justify-center">
                    {checking ? <FaSpinner className="animate-spin" /> : null} Validasi tiket
                  </button>
                </form>
                {result && <div className={`mt-5 rounded-lg border p-4 ${result.success ? 'border-green-400/30 bg-green-400/5' : 'border-red-400/30 bg-red-400/5'}`}>
                  <div className="flex items-center gap-2 font-semibold">{result.success ? <FaCheckCircle className="text-green-300" /> : <FaTimesCircle className="text-red-300" />}{result.message}</div>
                  {result.data && <div className="mt-3 space-y-1 text-sm text-white/70"><p>{result.data.concert}</p><p>Customer: {result.data.customerName || '-'}</p><p>Ticket {result.data.ticketNumber}</p><p>{new Date(result.data.scannedAt).toLocaleString('id-ID')}</p></div>}
                </div>}
              </section>
            </div>

            <section className="glass mt-6 overflow-hidden rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold"><FaUsers className="text-primary" /> Riwayat check-in</h2>
                  <p className="mt-1 text-sm text-white/50">{concerts.find((concert) => String(concert.id) === selectedConcertId)?.name} · tiket yang berhasil dipindai</p>
                </div>
                <span className="rounded-full bg-green-400/10 px-3 py-1 text-sm font-medium text-green-300">{scans.length} hadir</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-white/40">
                    <tr><th className="px-5 py-3 font-medium">Waktu check-in</th><th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Nomor tiket</th><th className="px-5 py-3 font-medium">Order</th><th className="px-5 py-3 font-medium">Petugas</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingScans ? (
                      <tr><td colSpan="5" className="px-5 py-8 text-center text-white/50"><FaSpinner className="mr-2 inline animate-spin" />Memuat riwayat...</td></tr>
                    ) : scans.length ? scans.map((scan) => (
                      <tr key={scan.id} className="text-white/75">
                        <td className="whitespace-nowrap px-5 py-3">{new Date(scan.scannedAt).toLocaleString('id-ID')}</td>
                        <td className="px-5 py-3">{scan.ticket?.order?.customerName || 'Customer'}</td>
                        <td className="px-5 py-3 font-mono text-xs">{scan.ticket?.ticketNumber || '-'}</td>
                        <td className="px-5 py-3 font-mono text-xs">{scan.ticket?.order?.orderNumber || '-'}</td>
                        <td className="px-5 py-3">{scan.scanner?.name || '-'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="px-5 py-10 text-center text-white/45">Belum ada tiket yang berhasil check-in untuk konser ini.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
