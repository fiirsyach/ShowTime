let snapScriptPromise;

const getSnap = ({ clientKey, isProduction }) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Midtrans Snap hanya tersedia di browser'));
  }
  if (window.snap) return Promise.resolve(window.snap);
  if (snapScriptPromise) return snapScriptPromise;

  snapScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => {
      if (window.snap) resolve(window.snap);
      else reject(new Error('Midtrans Snap gagal dimuat'));
    };
    script.onerror = () => reject(new Error('Tidak dapat memuat Midtrans Snap'));
    document.body.appendChild(script);
  }).catch((error) => {
    snapScriptPromise = null;
    throw error;
  });

  return snapScriptPromise;
};

export const openMidtransSnap = async ({ snapToken, clientKey, isProduction, ...callbacks }) => {
  const snap = await getSnap({ clientKey, isProduction });
  snap.pay(snapToken, callbacks);
};
