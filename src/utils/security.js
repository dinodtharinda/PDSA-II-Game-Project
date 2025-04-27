import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const TOKEN_BYTES = 32;

class Security {
  static async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static generateToken() {
    return crypto.randomBytes(TOKEN_BYTES).toString('hex');
  }

  static generateVerificationToken() {
    return this.generateToken();
  }

  static generateResetToken() {
    return this.generateToken();
  }

  // Password validation rules
  static validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Username validation
  static validateUsername(username) {
    const minLength = 3;
    const maxLength = 30;
    const validChars = /^[a-zA-Z0-9_-]+$/;

    const errors = [];
    if (username.length < minLength) {
      errors.push(`Username must be at least ${minLength} characters long`);
    }
    if (username.length > maxLength) {
      errors.push(`Username must be no more than ${maxLength} characters long`);
    }
    if (!validChars.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Session security helpers
  static sanitizeSession(session) {
    // Remove sensitive data before storing in session
    const { password, resetPasswordToken, verificationToken, ...cleanSession } = session;
    return cleanSession;
  }

  // CSRF token generation and validation
  static generateCsrfToken() {
    return this.generateToken();
  }

  static validateCsrfToken(token, storedToken) {
    if (!token || !storedToken) {
      return false;
    }
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(storedToken)
    );
  }
}

export default Security;