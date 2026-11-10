const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const getMediaUrl = (image) => {
  if (typeof image !== 'string' || !image.trim()) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const path = `/${image.replace(/^\/+/, '')}`;
  if (/ngrok/i.test(SERVER_URL)) {
    return `/api/media?path=${encodeURIComponent(path)}`;
  }
  return `${SERVER_URL}${path}`;
};

export const getConcertPoster = (galleries = []) => {
  if (!Array.isArray(galleries)) return null;
  const image = galleries.find((item) => ['poster', 'banner'].includes(item.type) && item.image)
    || galleries.find((item) => item.image);
  return getMediaUrl(image?.image);
};
