import { InvalidCnpjError } from '../errors/invalid-cnpj.error.js';

export class Cnpj {
  private constructor(readonly value: string) {}

  static create(raw: string): Cnpj {
    const digits = raw.replace(/\D/g, '');

    if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
      throw new InvalidCnpjError();
    }

    if (!Cnpj.isValid(digits)) {
      throw new InvalidCnpjError('Dígitos verificadores do CNPJ não conferem.');
    }

    return new Cnpj(digits);
  }

  private static isValid(digits: string): boolean {
    const checkDigit = (length: number): number => {
      let sum = 0;
      let weight = length - 7;
      for (let i = 0; i < length; i += 1) {
        sum += Number(digits[i]) * weight;
        weight -= 1;
        if (weight < 2) {
          weight = 9;
        }
      }
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    return (
      checkDigit(12) === Number(digits[12]) &&
      checkDigit(13) === Number(digits[13])
    );
  }

  get formatted(): string {
    return this.value.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );
  }

  equals(other: Cnpj): boolean {
    return this.value === other.value;
  }
}
