// backend/src/utils/encryption.js
const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ;
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypt a field value
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text (Base64 encoded)
 */
exports.encryptField = (text) => {
  if (!text) return text;
  
  try {
    // Create an initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return iv + encrypted data in base64 format
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text on error
  }
};

/**
 * Decrypt a field value
 * @param {string} encryptedText - Encrypted text to decrypt
 * @returns {string} - Decrypted text
 */
exports.decryptField = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  
  try {
    // Check if the text is in the expected format
    if (!encryptedText.includes(':')) return encryptedText;
    
    // Split iv and encrypted text
    const textParts = encryptedText.split(':');
    
    if (textParts.length !== 2) return encryptedText;
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedData = Buffer.from(textParts[1], 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return encrypted text on error
  }
};

/**
 * Mask a sensitive field like credit card or account number
 * @param {string} text - Text to mask
 * @param {number} visibleChars - Number of characters to keep visible at the end
 * @returns {string} - Masked text
 */
exports.maskSensitiveField = (text, visibleChars = 4) => {
  if (!text) return text;
  
  const textStr = text.toString();
  const length = textStr.length;
  
  if (length <= visibleChars) return textStr;
  
  const maskedPart = '*'.repeat(length - visibleChars);
  const visiblePart = textStr.substring(length - visibleChars);
  
  return `${maskedPart}${visiblePart}`;
};