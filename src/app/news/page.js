'use client';

import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-dark">
      <Navbar />

      <section className="pt-36 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-10">
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold">Latest</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">News & Features</h1>
          </div>

          <div className="card p-8 text-center text-white/60">
            Tidak ada berita yang tersedia saat ini. Konten akan muncul setelah admin menambahkan postingan di website.
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
