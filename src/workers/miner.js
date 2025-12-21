// Web Worker for proof-of-work mining
self.onmessage = async (e) => {
  const { challenge, difficulty } = e.data;
  let nonce = 0;
  const target = '0'.repeat(difficulty);

  while (true) {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(challenge + nonce.toString(16)));
    const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex.startsWith(target)) {
      self.postMessage({ type: 'found', nonce: nonce.toString(16) });
      return;
    }

    nonce++;
    if (nonce % 10000 === 0) {
      self.postMessage({ type: 'progress', attempts: nonce });
    }
  }
};