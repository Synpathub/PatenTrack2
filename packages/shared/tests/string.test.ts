import { describe, it, expect } from 'vitest';
import { normalize, trim, toLowerCase, toUpperCase, removeExtraSpaces, capitalize } from '../src/utils/string';

describe('String Utilities', () => {
  it('should normalize strings', () => {
    expect(normalize('  HELLO  WORLD  ')).toBe('hello world');
    expect(normalize('Test   String')).toBe('test string');
  });

  it('should trim strings', () => {
    expect(trim('  hello  ')).toBe('hello');
  });

  it('should convert to lowercase', () => {
    expect(toLowerCase('HELLO')).toBe('hello');
  });

  it('should convert to uppercase', () => {
    expect(toUpperCase('hello')).toBe('HELLO');
  });

  it('should remove extra spaces', () => {
    expect(removeExtraSpaces('hello   world')).toBe('hello world');
  });

  it('should capitalize strings', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('')).toBe('');
  });
});
