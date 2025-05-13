
/**
 * Web Crypto API based encryption utility
 * Using AES-GCM for symmetric encryption
 */

// Generate a secure encryption key
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
};

// Convert CryptoKey to a storable string format
export const exportKey = async (key: CryptoKey): Promise<string> => {
  const exportedKey = await window.crypto.subtle.exportKey("raw", key);
  return bufferToBase64(exportedKey);
};

// Import a key from string format
export const importKey = async (keyData: string): Promise<CryptoKey> => {
  const keyBuffer = base64ToBuffer(keyData);
  return await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    {
      name: "AES-GCM",
      length: 256
    },
    false, // not extractable after import for security
    ["encrypt", "decrypt"]
  );
};

// Encrypt text using AES-GCM
export const encryptText = async (text: string, key: CryptoKey): Promise<string> => {
  // Create initialization vector (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Convert text to buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Encrypt
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    data
  );
  
  // Combine IV and encrypted data for storage
  const result = new Uint8Array(iv.length + encryptedData.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encryptedData), iv.length);
  
  // Convert to base64 for easy transport
  return bufferToBase64(result);
};

// Decrypt text using AES-GCM
export const decryptText = async (encryptedText: string, key: CryptoKey): Promise<string> => {
  try {
    // Convert from base64
    const encryptedBuffer = base64ToBuffer(encryptedText);
    
    // Extract IV (first 12 bytes)
    const iv = encryptedBuffer.slice(0, 12);
    
    // Extract encrypted data (rest of buffer)
    const encryptedData = encryptedBuffer.slice(12);
    
    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      encryptedData
    );
    
    // Convert buffer to text
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt. Invalid key or corrupted data.");
  }
};

// Helper function to convert buffer to base64 string
const bufferToBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
  return window.btoa(binary);
};

// Helper function to convert base64 string to buffer
const base64ToBuffer = (base64: string): Uint8Array => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// Hash a password (simplified for client-side)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return bufferToBase64(hash);
};
