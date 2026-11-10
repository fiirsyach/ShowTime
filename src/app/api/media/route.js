const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');

export async function GET(request) {
  const path = new URL(request.url).searchParams.get('path');

  if (
    !path ||
    !path.startsWith('/uploads/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    path.split('/').includes('..')
  ) {
    return new Response('Invalid media path', { status: 400 });
  }

  let mediaUrl;
  try {
    mediaUrl = new URL(path, SERVER_URL);
  } catch {
    return new Response('Invalid media server URL', { status: 500 });
  }

  if (
    mediaUrl.origin !== new URL(SERVER_URL).origin ||
    !mediaUrl.pathname.startsWith('/uploads/')
  ) {
    return new Response('Invalid media URL', { status: 400 });
  }

  const headers = {};
  if (/ngrok/i.test(mediaUrl.hostname)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  const upstream = await fetch(mediaUrl, { headers });
  const contentType = upstream.headers.get('content-type') || '';

  if (!upstream.ok || !contentType.startsWith('image/')) {
    return new Response('Unable to load media from backend', {
      status: upstream.ok ? 502 : upstream.status,
    });
  }

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
