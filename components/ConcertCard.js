'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHeart, FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt, FaStar, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { getConcertPoster } from '../lib/media-url';
import { useSiteSettings } from '../context/SiteSettingsContext';

const ConcertCard = ({ concert, index }) => {
  const router = useRouter();
  const { user, loading: authLoading, wishlistConcertIds, wishlistBusyConcertIds, wishlistLoading, toggleWishlist } = useAuth();
  const { formatMoney, language, t } = useSiteSettings();
  const concertId = Number(concert.id);
  const isLiked = wishlistConcertIds.includes(concertId);
  const isWishlistBusy = wishlistBusyConcertIds.includes(concertId);

  const price = Number(concert.minPrice ?? concert.price ?? 0);
  const genre = concert.genre || 'Konser';
  const location = concert.venue?.name || concert.venueName || concert.location || 'Lokasi belum diatur';
  const badge = concert.badge || (concert.isFeatured ? 'Featured' : concert.isFlashSale ? 'Flash Sale' : null);
  const availableTickets = Number(concert.availableTickets ?? concert.available ?? 0);
  const soldTickets = Number(concert.ticketsSold ?? concert.soldTickets ?? 0);
  const concertDate = concert.date || null;
  const cardLink = `/concerts/${concert.slug || concert.id}`;
  const poster = getConcertPoster(concert.concertGalleries);

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Sold Out':
        return 'bg-red-500';
      case 'Almost Full':
        return 'bg-yellow-500';
      case 'New':
        return 'bg-green-500';
      case 'Featured':
        return 'bg-primary';
      case 'Flash Sale':
        return 'bg-secondary';
      default:
        return 'bg-primary/80';
    }
  };

  const getBadgeIcon = (status) => {
    switch (status) {
      case 'Sold Out':
        return '🔴';
      case 'Almost Full':
        return '🟡';
      case 'New':
        return '🟢';
      case 'Featured':
        return '⭐';
      case 'Flash Sale':
        return '⚡';
      default:
        return '🎵';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="card group relative overflow-hidden"
    >
      <Link href={cardLink}>
        <div className="relative aspect-[4/5] overflow-hidden bg-dark/50">
          {poster ? (
            <Image src={poster} alt={`Poster ${concert.name}`} fill unoptimized className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <span className="text-6xl opacity-30">🎵</span>
            </div>
          )}

          {badge && (
            <div className={`absolute top-4 left-4 px-3 py-1.5 ${getBadgeColor(badge)} rounded-full text-xs font-medium flex items-center gap-1 shadow-lg`}>
              <span>{getBadgeIcon(badge)}</span>
              <span>{badge}</span>
            </div>
          )}

          <div className="absolute top-4 right-16 px-2 py-1 bg-dark/50 backdrop-blur-sm rounded-full text-xs flex items-center gap-1">
            <FaStar className="text-yellow-400 w-3 h-3" />
            <span className="text-white">4.8</span>
          </div>

          <button
            type="button"
            aria-label={isLiked ? 'Hapus dari wishlist' : 'Tambahkan ke wishlist'}
            title={isLiked ? 'Hapus dari wishlist' : 'Tambahkan ke wishlist'}
            disabled={authLoading || (user?.role === 'customer' && wishlistLoading) || isWishlistBusy || !concert.id || (user && user.role !== 'customer')}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user) {
                router.push('/login');
                return;
              }
              toggleWishlist(concert.id);
            }}
            className="absolute top-4 right-4 p-2.5 glass rounded-full hover:bg-white/20 transition-all duration-300 group/fav disabled:cursor-wait disabled:opacity-60"
          >
            <FaHeart className={`w-4 h-4 transition-colors duration-300 ${isLiked ? 'text-red-500' : 'text-white/60 group-hover/fav:text-white'}`} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-dark via-dark/80 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">{t('Starting from')}</p>
                <span className="text-2xl font-bold text-gradient">
                  {formatMoney(price)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/60 bg-dark/50 px-3 py-1 rounded-full">
                <FaClock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(concertDate), { addSuffix: true, locale: language === 'en' ? enUS : id })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {concert.name}
              </h3>
              <p className="text-sm text-white/60">{genre}</p>
            </div>
            <div className="ml-2 px-2 py-0.5 bg-primary/20 rounded text-xs text-primary font-medium">
              {concert.genre || concert.category || 'Concert'}
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <FaMapMarkerAlt className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <FaCalendarAlt className="w-3 h-3 text-secondary flex-shrink-0" />
              <span>{new Date(concertDate).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { weekday: 'long', month: 'short', day: '2-digit', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[8px] font-bold">
                {soldTickets >= 1000 ? `${Math.round(soldTickets / 1000)}k` : soldTickets}
              </div>
              <span className="text-xs text-white/40">{t('sold')}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${availableTickets > 0 ? 'text-primary' : 'text-red-400'}`}>
              <FaTicketAlt className="w-3 h-3" />
              <span>{availableTickets > 0 ? `${availableTickets} ${t('left')}` : t('Sold Out')}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ConcertCard;