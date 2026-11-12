'use client';

import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    router.replace(user.role === 'organizer' ? '/organizer/profile' : '/profile');
  }, [loading, router, user]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark text-white/60">
      Mengarahkan ke profil...
    </main>
  );
}
