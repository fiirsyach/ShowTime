const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const getMediaUrl = (image) => {
  if (typeof image !== 'string' || !image.trim()) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SERVER_URL}/${image.replace(/^\/+/, '')}`;
};

export const getConcertPoster = (galleries = []) => {
  if (!Array.isArray(galleries)) return null;
  const image = galleries.find((item) => ['poster', 'banner'].includes(item.type) && item.image)
    || galleries.find((item) => item.image);
  return getMediaUrl(image?.image);
};
