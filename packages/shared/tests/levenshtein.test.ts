import { describe, it, expect } from 'vitest';
import { levenshteinDistance, similarityRatio } from '../src/utils/levenshtein';

describe('Levenshtein Distance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('test', 'test')).toBe(0);
  });

  it('should calculate distance for different strings', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });

  it('should handle empty strings', () => {
    expect(levenshteinDistance('', 'test')).toBe(4);
    expect(levenshteinDistance('test', '')).toBe(4);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should calculate similarity ratio', () => {
    expect(similarityRatio('test', 'test')).toBe(1);
    expect(similarityRatio('', '')).toBe(1);
    const ratio = similarityRatio('kitten', 'sitting');
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThan(1);
  });
});
