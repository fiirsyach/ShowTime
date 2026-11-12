'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { FaArrowRight, FaBolt } from 'react-icons/fa';
import ConcertCard from './ConcertCard';
import { useSiteSettings } from '../context/SiteSettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ConcertSection = ({ id, title, subtitle, viewAll, filter = '', flashSale = false }) => {
  const { t } = useSiteSettings();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        let endpoint = '/concerts';

        if (filter === 'trending') endpoint = '/concerts/featured';
        else if (filter === 'upcoming') endpoint = '/concerts/upcoming';
        else if (filter === 'flash-sale') endpoint = '/concerts/flash-sale';
        else if (filter === 'festival') endpoint = '/concerts?search=festival';

        const response = await axios.get(`${API_URL}${endpoint}`);
        const data = response?.data?.data || [];

        setConcerts(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (error) {
        console.error('Failed to load concerts section:', error);
        setConcerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [filter]);

  const displayedConcerts = concerts;

  return (
    <section id={id} className="py-20 bg-dark/30 scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-2 block">
                {flashSale ? `⚡ ${t('Limited Time')}` : `🎵 ${t('Live Events')}`}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {t(title)}
                {flashSale && (
                  <span className="ml-3 inline-block px-4 py-1 bg-secondary text-white text-sm rounded-full animate-pulse">
                    HOT!
                  </span>
                )}
              </h2>
              {subtitle && (
                <p className="text-white/60 mt-2 text-lg">{t(subtitle)}</p>
              )}
            </motion.div>
          </div>
          {viewAll && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 md:mt-0"
            >
              <Link
                href={viewAll}
                className="group inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <span>{t('View All Events')}</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          )}
        </div>

        {flashSale && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 p-6 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-2xl border border-secondary/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-2xl">
                  <FaBolt className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">⚡ Flash Sale!</h4>
                  <p className="text-white/60 text-sm">{t('Limited time offer - up to 50% off selected events')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-dark/50 px-3 py-1 rounded-full text-white/60">{t('Ends in')}</span>
                <span className="font-mono font-bold text-secondary">02:15:30</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card animate-pulse h-[420px]">
                <div className="h-72 bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/10 rounded" />
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                </div>
              </div>
            ))
          ) : displayedConcerts.length > 0 ? (
            displayedConcerts.map((concert, index) => (
              <ConcertCard key={concert.id || `${concert.name}-${index}`} concert={concert} index={index} />
            ))
          ) : (
            <div className="col-span-full card p-8 text-center text-white/60">
              {t('Belum ada event yang tersedia untuk kategori ini.')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConcertSection;