import { describe, it, expect } from 'vitest';
import { todayStr } from './date.js';

describe('todayStr', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const d = new Date('2026-08-30T15:30:00Z');
    expect(todayStr(d)).toBe('2026-08-30');
  });

  it('defaults to now when no argument is given', () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('handles year boundaries', () => {
    expect(todayStr(new Date('2025-12-31T23:59:00Z'))).toBe('2025-12-31');
    expect(todayStr(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01');
  });
});
