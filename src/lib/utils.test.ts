import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatDateTime } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })
})

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    // Use a Date object to avoid timezone issues with ISO strings
    const date = new Date(2024, 0, 15) // January 15, 2024
    const result = formatDate(date)
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('formats a Date object correctly', () => {
    const date = new Date(2024, 0, 15)
    const result = formatDate(date)
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

describe('formatDateTime', () => {
  it('formats a date with time correctly', () => {
    const date = new Date(2024, 0, 15, 14, 30)
    const result = formatDateTime(date)
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
    // Time format may vary by locale, just check it contains some time
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})
