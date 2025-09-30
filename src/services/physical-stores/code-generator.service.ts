import { ICodeGenerator, ICodeValidator } from './interfaces';

// Single Responsibility: Code generation and validation
export class SecureCodeGenerator implements ICodeGenerator {
  private readonly CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly EXCLUDED_CHARS = ['0', 'O', '1', 'I', 'L']; // Avoid confusing characters

  generateSecureCode(length: number = 6): string {
    const allowedChars = this.CHARACTERS
      .split('')
      .filter(char => !this.EXCLUDED_CHARS.includes(char))
      .join('');

    let result = '';
    const charactersLength = allowedChars.length;

    // Use crypto.getRandomValues for secure random generation
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += allowedChars.charAt(array[i] % charactersLength);
    }

    return result;
  }

  async generateQRCode(data: string): Promise<string> {
    // In a real implementation, you would use a QR code library like 'qrcode'
    // For now, we'll return a base64 encoded data URL placeholder
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    canvas.width = 200;
    canvas.height = 200;

    // Simple placeholder QR code representation
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', 100, 100);
    ctx.fillText(data.substring(0, 20) + '...', 100, 120);

    return canvas.toDataURL();
  }
}

export class CodeValidator implements ICodeValidator {
  validateCode(code: string, expectedCode: string): boolean {
    if (!code || !expectedCode) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeEqual(code.toUpperCase(), expectedCode.toUpperCase());
  }

  isCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  isCodeFormat(code: string): boolean {
    // Validate format: 6 alphanumeric characters, excluding confusing ones
    const pattern = /^[2-9A-HJ-NP-Z]{6}$/;
    return pattern.test(code.toUpperCase());
  }

  private constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}