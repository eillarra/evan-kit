import { describe, it, expect } from 'vitest';

import { toRomanNumeral, formatDecimal } from '@evan/utils/numbers';

describe('toRomanNumeral', () => {
  it('should convert single digits correctly', () => {
    expect(toRomanNumeral(1)).toBe('I');
    expect(toRomanNumeral(2)).toBe('II');
    expect(toRomanNumeral(3)).toBe('III');
    expect(toRomanNumeral(4)).toBe('IV');
    expect(toRomanNumeral(5)).toBe('V');
    expect(toRomanNumeral(9)).toBe('IX');
  });

  it('should convert tens correctly', () => {
    expect(toRomanNumeral(10)).toBe('X');
    expect(toRomanNumeral(20)).toBe('XX');
    expect(toRomanNumeral(40)).toBe('XL');
    expect(toRomanNumeral(50)).toBe('L');
    expect(toRomanNumeral(90)).toBe('XC');
  });

  it('should convert hundreds correctly', () => {
    expect(toRomanNumeral(100)).toBe('C');
    expect(toRomanNumeral(400)).toBe('CD');
    expect(toRomanNumeral(500)).toBe('D');
    expect(toRomanNumeral(900)).toBe('CM');
  });

  it('should convert thousands correctly', () => {
    expect(toRomanNumeral(1000)).toBe('M');
    expect(toRomanNumeral(2000)).toBe('MM');
    expect(toRomanNumeral(3000)).toBe('MMM');
  });

  it('should handle complex numbers', () => {
    expect(toRomanNumeral(1994)).toBe('MCMXCIV');
    expect(toRomanNumeral(2023)).toBe('MMXXIII');
    expect(toRomanNumeral(3999)).toBe('MMMCMXCIX');
  });

  it('should handle edge cases', () => {
    expect(() => toRomanNumeral(0)).toThrow('Number must be between 1 and 3999');
    expect(() => toRomanNumeral(-5)).toThrow('Number must be between 1 and 3999');
    expect(() => toRomanNumeral(4000)).toThrow('Number must be between 1 and 3999');
    expect(() => toRomanNumeral(5000)).toThrow('Number must be between 1 and 3999');
  });
});

describe('formatDecimal', () => {
  it('should format numbers with Belgian locale', () => {
    expect(formatDecimal(5)).toBe('5,0');
    expect(formatDecimal(10.5)).toBe('10,5');
    expect(formatDecimal(100)).toBe('100,0');
    expect(formatDecimal(1000)).toBe('1.000,0');
  });

  it('should handle decimal places correctly', () => {
    expect(formatDecimal(5.123)).toBe('5,1');
    expect(formatDecimal(5.789)).toBe('5,8');
  });

  it('should handle large numbers', () => {
    expect(formatDecimal(1234567.89)).toBe('1.234.567,9');
  });

  it('should handle zero', () => {
    expect(formatDecimal(0)).toBe('0,0');
  });

  it('should handle negative numbers', () => {
    expect(formatDecimal(-5.5)).toBe('-5,5');
    expect(formatDecimal(-1000)).toBe('-1.000,0');
  });
});
