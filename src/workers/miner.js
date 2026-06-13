// Web Worker for proof-of-work mining
function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

self.onmessage = async (e) => {
  const { challenge, difficulty } = e.data;
  let nonce = 0;
  const target = "0".repeat(difficulty);

  const challengeBytes = hexToBytes(challenge);

  while (true) {
    const nonceHex = nonce.toString(16);
    const nonceBytes = hexToBytes(nonceHex.length % 2 === 0 ? nonceHex : "0" + nonceHex); // ensure even length
    const data = new Uint8Array([...challengeBytes, ...nonceBytes]);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashHex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hashHex.startsWith(target)) {
      self.postMessage({ type: "found", nonce: nonceHex });
      return;
    }

    nonce++;
    if (nonce % 10000 === 0) {
      self.postMessage({ type: "progress", attempts: nonce });
    }
  }
};
