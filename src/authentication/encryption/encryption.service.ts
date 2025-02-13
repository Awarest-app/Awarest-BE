import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly SECRET_KEY =
    process.env.ENCRYPTION_KEY || 'default-secret-key';

  /**
   * Encrypt a string using AES encryption
   * @param text Text to encrypt
   * @returns Encrypted text
   */
  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.SECRET_KEY).toString();
  }

  /**
   * Decrypt an encrypted string
   * @param encryptedText Text to decrypt
   * @returns Decrypted text
   */
  decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Extract username from email (part before @)
   * @param email Email address
   * @returns Username portion of email
   */
  extractUsernameFromEmail(email: string): string {
    return email.split('@')[0];
  }
}
