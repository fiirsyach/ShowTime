'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark text-white/60">Memuat...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token || otp, password, token ? undefined : email.trim());
    if (result.success) {
      setMessage('Password berhasil diubah. Silakan masuk dengan password baru Anda.');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-8 rounded-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">ShowTime</h1>
          <p className="text-white/60 mt-2">Buat password baru</p>
        </div>
        {!token && !email ? (
          <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            Tautan reset tidak valid. Minta tautan reset baru dari halaman lupa password.
          </div>
        ) : (
          <>
            {error && <div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
            {message && <div role="status" className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm">{message}</div>}
            {!message && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {!token && (
                  <>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email address</label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="input-field"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-white/80 mb-2">Kode OTP</label>
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                        placeholder="6 digit kode dari email"
                        className="input-field"
                        required
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">Password baru</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="input-field pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-white/80 mb-2">Konfirmasi password baru</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Ulangi password baru"
                      className="input-field pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-lg">
                  {loading ? 'Menyimpan...' : 'Simpan password baru'}
                </button>
              </form>
            )}
          </>
        )}
        <p className="text-center text-white/60 mt-6">
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium">Kembali ke login</Link>
        </p>
      </motion.main>
    </div>
  );
}
