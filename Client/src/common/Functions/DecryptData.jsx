import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

export const decryptData = (encryptedData) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};
