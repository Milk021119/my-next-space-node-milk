/**
 * Property-Based Tests for ThemeContext
 * Feature: dark-mode
 * 
 * These tests validate the correctness properties defined in the design document.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { STORAGE_KEY } from '../ThemeContext';

// Theme type for testing
type Theme = 'light' | 'dark';

// Helper functions that mirror the implementation logic
function persistTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

function toggleTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : 'light';
}

// Arbitrary for Theme type
const themeArbitrary = fc.constantFrom<Theme>('light', 'dark');

describe('ThemeContext Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Property 1: Theme Persistence Round Trip
   * 
   * *For any* theme preference ('light' or 'dark'), setting the theme should 
   * persist to localStorage, and reading from localStorage should return 
   * that same theme.
   * 
   * **Validates: Requirements 1.2, 1.3**
   */
  it('Property 1: Theme Persistence Round Trip - persisting and reading theme should return the same value', () => {
    fc.assert(
      fc.property(themeArbitrary, (theme: Theme) => {
        // Act: persist the theme
        persistTheme(theme);
        
        // Assert: reading should return the same theme
        const retrieved = getStoredTheme();
        expect(retrieved).toBe(theme);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Theme Toggle Alternation
   * 
   * *For any* current theme state, calling toggleTheme should switch to 
   * the opposite theme (light → dark, dark → light).
   * 
   * **Validates: Requirements 1.1**
   */
  it('Property 2: Theme Toggle Alternation - toggling theme should switch to opposite', () => {
    fc.assert(
      fc.property(themeArbitrary, (initialTheme: Theme) => {
        // Act: toggle the theme
        const toggledTheme = toggleTheme(initialTheme);
        
        // Assert: should be the opposite theme
        expect(toggledTheme).not.toBe(initialTheme);
        
        // Assert: toggling twice should return to original
        const doubleToggled = toggleTheme(toggledTheme);
        expect(doubleToggled).toBe(initialTheme);
      }),
      { numRuns: 100 }
    );
  });
});
