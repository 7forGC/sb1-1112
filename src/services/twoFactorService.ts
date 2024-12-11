import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

// TOTP implementation without external dependencies
class TOTP {
  private static readonly TIME_STEP = 30;
  private static readonly CODE_LENGTH = 6;

  static generateSecret(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static generateTOTP(secret: string, counter: number = Math.floor(Date.now() / 1000 / this.TIME_STEP)): string {
    // This is a simplified TOTP implementation
    // In production, use a proper TOTP library or server-side implementation
    const hash = this.hmacSha1(secret, counter.toString());
    const offset = hash[hash.length - 1] & 0xf;
    const binary = ((hash[offset] & 0x7f) << 24) |
                  ((hash[offset + 1] & 0xff) << 16) |
                  ((hash[offset + 2] & 0xff) << 8) |
                  (hash[offset + 3] & 0xff);
    const otp = binary % Math.pow(10, this.CODE_LENGTH);
    return otp.toString().padStart(this.CODE_LENGTH, '0');
  }

  private static hmacSha1(key: string, message: string): Uint8Array {
    // This is a placeholder - in production use a proper HMAC-SHA1 implementation
    // or handle 2FA verification server-side
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    return new Uint8Array(20); // Return dummy hash for demo
  }
}

export const twoFactorService = {
  async setupTwoFactor(userId: string) {
    const secret = TOTP.generateSecret();
    const backupCodes = Array.from({ length: 8 }, () => uuidv4().slice(0, 8));

    const { error } = await supabase
      .from('two_factor')
      .insert([{
        user_id: userId,
        secret,
        enabled: false,
        backup_codes: backupCodes,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    const otpauthUrl = `otpauth://totp/7ForAll:${userId}?secret=${secret}&issuer=7ForAll`;

    return {
      secret,
      otpauthUrl,
      backupCodes
    };
  },

  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('two_factor')
      .select('secret')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data?.secret) throw new Error('2FA not set up');

    // In production, verify the token server-side
    const isValid = TOTP.generateTOTP(data.secret) === token;

    if (isValid) {
      const { error: updateError } = await supabase
        .from('two_factor')
        .update({ enabled: true })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    }

    return isValid;
  },

  async verify(userId: string, token: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('two_factor')
      .select('secret, enabled, backup_codes')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data?.enabled) return true;

    // Check if token matches current TOTP
    const isValidTOTP = TOTP.generateTOTP(data.secret) === token;
    if (isValidTOTP) return true;

    // Check if token is a valid backup code
    const isValidBackupCode = data.backup_codes.includes(token);
    if (isValidBackupCode) {
      // Remove used backup code
      const { error: updateError } = await supabase
        .from('two_factor')
        .update({
          backup_codes: data.backup_codes.filter(code => code !== token)
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
      return true;
    }

    return false;
  },

  async disable(userId: string): Promise<void> {
    const { error } = await supabase
      .from('two_factor')
      .update({ enabled: false })
      .eq('user_id', userId);

    if (error) throw error;
  },

  async generateNewBackupCodes(userId: string): Promise<string[]> {
    const newBackupCodes = Array.from({ length: 8 }, () => uuidv4().slice(0, 8));

    const { error } = await supabase
      .from('two_factor')
      .update({ backup_codes: newBackupCodes })
      .eq('user_id', userId);

    if (error) throw error;
    return newBackupCodes;
  }
};