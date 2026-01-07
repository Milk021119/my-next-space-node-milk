/**
 * Property-Based Tests for Bookmark Service
 * Feature: bookmark-system
 * 
 * These tests validate the correctness properties defined in the design document.
 * Note: These tests mock Supabase to test the logic without database dependency.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Mock Supabase before importing bookmarks module
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../supabase';
import {
  isBookmarked,
  addBookmark,
  removeBookmark,
  toggleBookmark,
} from '../bookmarks';

// In-memory bookmark store for testing
let bookmarkStore: Map<string, Set<number>>;

// Helper to create composite key
const getKey = (userId: string, postId: number) => `${userId}:${postId}`;

// Setup mock implementations
function setupMocks() {
  bookmarkStore = new Map();

  const mockFrom = vi.fn((table: string) => {
    if (table !== 'bookmarks') return {};

    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockImplementation((data: { user_id: string; post_id: number }) => {
        const userBookmarks = bookmarkStore.get(data.user_id) || new Set();
        if (userBookmarks.has(data.post_id)) {
          return { error: { code: '23505', message: 'duplicate' } };
        }
        userBookmarks.add(data.post_id);
        bookmarkStore.set(data.user_id, userBookmarks);
        return { error: null };
      }),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(function(this: any, field: string, value: any) {
        this._filters = this._filters || {};
        this._filters[field] = value;
        return {
          ...this,
          eq: this.eq.bind(this),
          single: () => {
            const userId = this._filters?.user_id;
            const postId = this._filters?.post_id;
            if (userId && postId !== undefined) {
              const userBookmarks = bookmarkStore.get(userId);
              if (userBookmarks?.has(postId)) {
                return { data: { id: 1 }, error: null };
              }
            }
            return { data: null, error: { code: 'PGRST116' } };
          },
        };
      }),
      single: vi.fn().mockImplementation(function(this: any) {
        return { data: null, error: { code: 'PGRST116' } };
      }),
    };
  });

  // Override delete chain
  const originalFrom = mockFrom;
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    const base = originalFrom(table);
    
    // Handle delete operation
    const deleteChain = {
      _filters: {} as Record<string, any>,
      eq: function(field: string, value: any) {
        this._filters[field] = value;
        return this;
      },
      then: function(resolve: (result: any) => void) {
        const userId = this._filters.user_id;
        const postId = this._filters.post_id;
        if (userId && postId !== undefined) {
          const userBookmarks = bookmarkStore.get(userId);
          if (userBookmarks) {
            userBookmarks.delete(postId);
          }
        }
        resolve({ error: null });
      },
    };

    return {
      ...base,
      delete: () => deleteChain,
    } as any;
  });
}

// Arbitraries for generating test data
const userIdArbitrary = fc.uuid();
const postIdArbitrary = fc.integer({ min: 1, max: 10000 });

describe('Bookmark Service Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  /**
   * Property 1: Bookmark Round Trip
   * 
   * *For any* valid user and post combination, adding a bookmark then 
   * querying should return that the post is bookmarked.
   * 
   * **Validates: Requirements 1.1, 1.4**
   */
  it('Property 1: Bookmark Round Trip - adding then checking should return true', async () => {
    await fc.assert(
      fc.asyncProperty(userIdArbitrary, postIdArbitrary, async (userId, postId) => {
        // Arrange: ensure not bookmarked initially
        const userBookmarks = bookmarkStore.get(userId) || new Set();
        userBookmarks.delete(postId);
        bookmarkStore.set(userId, userBookmarks);

        // Act: add bookmark
        await addBookmark(userId, postId);

        // Assert: should be bookmarked
        const result = await isBookmarked(userId, postId);
        expect(result).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Unbookmark Removes Record
   * 
   * *For any* bookmarked post, removing the bookmark then querying 
   * should return that the post is not bookmarked.
   * 
   * **Validates: Requirements 2.1**
   */
  it('Property 2: Unbookmark Removes Record - removing then checking should return false', async () => {
    await fc.assert(
      fc.asyncProperty(userIdArbitrary, postIdArbitrary, async (userId, postId) => {
        // Arrange: ensure bookmarked first
        const userBookmarks = bookmarkStore.get(userId) || new Set();
        userBookmarks.add(postId);
        bookmarkStore.set(userId, userBookmarks);

        // Act: remove bookmark
        await removeBookmark(userId, postId);

        // Assert: should not be bookmarked
        const result = await isBookmarked(userId, postId);
        expect(result).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Toggle Idempotence (Double Toggle)
   * 
   * *For any* user and post, toggling twice should return to the original state.
   * 
   * **Validates: Requirements 1.1, 2.1**
   */
  it('Property 3: Toggle Idempotence - double toggle returns to original state', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        postIdArbitrary,
        fc.boolean(),
        async (userId, postId, initiallyBookmarked) => {
          // Arrange: set initial state
          const userBookmarks = bookmarkStore.get(userId) || new Set();
          if (initiallyBookmarked) {
            userBookmarks.add(postId);
          } else {
            userBookmarks.delete(postId);
          }
          bookmarkStore.set(userId, userBookmarks);

          // Act: toggle twice
          await toggleBookmark(userId, postId);
          await toggleBookmark(userId, postId);

          // Assert: should be back to original state
          const result = await isBookmarked(userId, postId);
          expect(result).toBe(initiallyBookmarked);
        }
      ),
      { numRuns: 100 }
    );
  });
});
