// import { Injectable } from '@nestjs/common';
// import * as CryptoJS from 'crypto-js';

// @Injectable()
// export class EncryptionService {
//   private readonly SECRET_KEY = process.env.ENCRYPTION_KEY;

//   /**
//    * Encrypt a string using AES encryption
//    * @param text Text to encrypt
//    * @returns Encrypted text
//    */
//   encrypt(text: string): string {
//     return CryptoJS.AES.encrypt(text, this.SECRET_KEY).toString();
//   }

//   /**
//    * Decrypt an encrypted string
//    * @param encryptedText Text to decrypt
//    * @returns Decrypted text
//    */
//   decrypt(encryptedText: string): string {
//     const bytes = CryptoJS.AES.decrypt(encryptedText, this.SECRET_KEY);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   }

//   /**
//    * Extract username from email (part before @)
//    * @param email Email address
//    * @returns Username portion of email
//    */
//   extractUsernameFromEmail(email: string): string {
//     return email.split('@')[0];
//   }
// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  private readonly SECRET_KEY = process.env.ENCRYPTION_KEY;

  /**
   * Encrypt a string using AES encryption deterministically
   * @param text Text to encrypt
   * @returns Encrypted text
   */
  encrypt(text: string): string {
    // SECRET_KEY와 IV를 WordArray로 변환
    const key = CryptoJS.enc.Utf8.parse(this.SECRET_KEY);
    // 결정적 암호화를 위해 고정 IV 사용 (16바이트)
    // const iv = CryptoJS.enc.Utf8.parse('0000000000000000');

    const deterministicIV = this.configService.get<string>('DETERMINISTIC_IV');

    const iv = CryptoJS.enc.Utf8.parse(deterministicIV);

    const encrypted = CryptoJS.AES.encrypt(text, key, { iv });
    return encrypted.toString();
  }

  /**ENCRYPTION_TIME
   * Decrypt an encrypted string
   * @param encryptedText Text to decrypt
   * @returns Decrypted text
   */
  decrypt(encryptedText: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.SECRET_KEY);

    const deterministicIV = this.configService.get<string>('DETERMINISTIC_IV');

    const iv = CryptoJS.enc.Utf8.parse(deterministicIV);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv });
    return decrypted.toString(CryptoJS.enc.Utf8);
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
