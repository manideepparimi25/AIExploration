import { describe, it, expect } from 'vitest';
import {
  statusLabel,
  priorityLabel,
  initials,
  formatDate,
} from './format.js';

describe('statusLabel', () => {
  it('maps known statuses to human labels', () => {
    expect(statusLabel('TODO')).toBe('To Do');
    expect(statusLabel('IN_PROGRESS')).toBe('In Progress');
    expect(statusLabel('DONE')).toBe('Done');
  });

  it('returns the input for unknown statuses', () => {
    expect(statusLabel('ARCHIVED')).toBe('ARCHIVED');
  });
});

describe('priorityLabel', () => {
  it('maps priorities', () => {
    expect(priorityLabel('HIGH')).toBe('High');
    expect(priorityLabel('MEDIUM')).toBe('Medium');
    expect(priorityLabel('LOW')).toBe('Low');
  });
});

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Sam Member')).toBe('SM');
    expect(initials('Avery Lead')).toBe('AL');
  });

  it('handles single names', () => {
    expect(initials('Cher')).toBe('C');
  });

  it('returns ? for empty input', () => {
    expect(initials('')).toBe('?');
    expect(initials(null)).toBe('?');
  });
});

describe('formatDate', () => {
  it('formats an ISO string', () => {
    const out = formatDate('2026-08-30T15:30:00Z');
    expect(out).toMatch(/2026/);
  });

  it('returns empty string for bad input', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });
});
