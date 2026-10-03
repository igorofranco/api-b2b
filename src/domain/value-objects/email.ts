import { InvalidEmailError } from '../errors/invalid-email.error.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();

    if (normalized.length === 0 || normalized.length > 254) {
      throw new InvalidEmailError();
    }

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailError();
    }

    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
