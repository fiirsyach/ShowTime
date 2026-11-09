'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await forgotPassword(email);
    if (result.success) {
      setMessage(result.message);
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
          <h1 className="text-3xl font-bold text-gradient">ConcertHub</h1>
          <p className="text-white/60 mt-2">Reset password</p>
        </div>
        <p className="text-white/70 text-sm mb-6">
          Masukkan email akun Anda. Kode OTP 6 digit untuk reset password akan dikirim ke email tersebut.
        </p>
        {error && <div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
        {message && (
          <div role="status" className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm">
            {message}{' '}
            <Link href={`/reset-password?email=${encodeURIComponent(email.trim())}`} className="font-medium underline">
              Masukkan kode OTP
            </Link>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="input-field pl-12"
                required
                disabled={loading}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-lg">
            {loading ? 'Mengirim...' : 'Kirim kode OTP'}
          </button>
        </form>
        <p className="text-center text-white/60 mt-6">
          Ingat password Anda? <Link href="/login" className="text-primary hover:text-primary/80 font-medium">Kembali ke login</Link>
        </p>
      </motion.main>
    </div>
  );
}
