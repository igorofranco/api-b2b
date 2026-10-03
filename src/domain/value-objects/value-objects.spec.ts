import { describe, expect, it } from 'vitest';
import { Cnpj } from './cnpj.js';
import { IdempotencyKey } from './idempotency-key.js';
import { Money } from './money.js';
import { Quantity } from './quantity.js';
import { Sku } from './sku.js';

describe('Money', () => {
  it('aceita centavos inteiros não negativos', () => {
    expect(Money.fromCents(1500).cents).toBe(1500);
  });

  it('rejeita valor negativo ou fracionário', () => {
    expect(() => Money.fromCents(-1)).toThrow();
    expect(() => Money.fromCents(10.5)).toThrow();
  });

  it('soma e multiplica sem perda de precisão', () => {
    const money = Money.fromCents(1500);
    expect(money.plus(Money.fromCents(500)).cents).toBe(2000);
    expect(money.times(3).cents).toBe(4500);
  });
});

describe('Sku', () => {
  it('normaliza para maiúsculas com hífen', () => {
    expect(Sku.create(' par m8 ').value).toBe('PAR-M8');
  });

  it('rejeita valor curto', () => {
    expect(() => Sku.create('A')).toThrow();
  });
});

describe('Quantity', () => {
  it('aceita inteiro positivo', () => {
    expect(Quantity.create(10).value).toBe(10);
  });

  it('rejeita zero ou fracionário', () => {
    expect(() => Quantity.create(0)).toThrow();
    expect(() => Quantity.create(1.5)).toThrow();
  });
});

describe('Cnpj', () => {
  it('valida dígitos verificadores', () => {
    expect(Cnpj.create('11.222.333/0001-81').value).toBe('11222333000181');
    expect(Cnpj.create('11222333000181').formatted).toBe('11.222.333/0001-81');
  });

  it('rejeita CNPJ inválido', () => {
    expect(() => Cnpj.create('11222333000182')).toThrow();
    expect(() => Cnpj.create('11111111111111')).toThrow();
  });
});

describe('IdempotencyKey', () => {
  it('exige tamanho mínimo', () => {
    expect(() => IdempotencyKey.create('abc')).toThrow();
    expect(IdempotencyKey.create('6f2a1c3e-9d4b').value).toBe('6f2a1c3e-9d4b');
  });
});
