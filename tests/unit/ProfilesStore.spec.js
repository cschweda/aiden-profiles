import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useProfilesStore } from '@/store/profiles';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
  };
})();

// Replace the global localStorage with our mock
vi.stubGlobal('localStorage', localStorageMock);

// Mock the document.documentElement
document.documentElement.setAttribute = vi.fn();

describe('Profiles Store', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia());
    
    // Clear the localStorage mock
    localStorageMock.clear();
    
    // Reset spy history
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const store = useProfilesStore();
    
    expect(store.profiles).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
    expect(store.sources).toEqual([]);
    expect(store.selectedSource).toBe('All');
    expect(store.theme).toBe('dark'); // Default when not in localStorage
  });

  it('filters profiles by source correctly', () => {
    const store = useProfilesStore();
    
    // Load sample data
    store.loadSampleData();
    
    // Check that we have profiles loaded
    expect(store.profiles.length).toBeGreaterThan(0);
    
    // All profiles should be returned when selectedSource is 'All'
    store.selectedSource = 'All';
    expect(store.filteredProfiles.length).toBe(store.profiles.length);
    
    // Filter by a specific source
    const ethiopianProfiles = store.profiles.filter(p => p.source === 'Ethiopia');
    expect(ethiopianProfiles.length).toBeGreaterThan(0);
    
    store.selectedSource = 'Ethiopia';
    expect(store.filteredProfiles.length).toBe(ethiopianProfiles.length);
    expect(store.filteredProfiles.every(p => p.source === 'Ethiopia')).toBe(true);
  });

  it('toggles theme correctly', () => {
    const store = useProfilesStore();
    
    // Initial theme should be 'dark'
    expect(store.theme).toBe('dark');
    
    // Toggle to light
    store.toggleTheme();
    expect(store.theme).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    
    // Toggle back to dark
    store.toggleTheme();
    expect(store.theme).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('parses CSV rows correctly', () => {
    const store = useProfilesStore();
    
    const csvRows = [
      ['name', 'source', 'notes'],
      ['Coffee 1', 'Ethiopia', 'Floral, Citrus'],
      ['Coffee 2', 'Colombia', 'Chocolate, Caramel']
    ];
    
    const parsed = store.parseRows(csvRows);
    
    expect(parsed.length).toBe(2);
    expect(parsed[0].name).toBe('Coffee 1');
    expect(parsed[0].source).toBe('Ethiopia');
    expect(parsed[0].notes).toBe('Floral, Citrus');
    expect(parsed[0].id).toBe('coffee-1');
    
    expect(parsed[1].name).toBe('Coffee 2');
    expect(parsed[1].source).toBe('Colombia');
    expect(parsed[1].notes).toBe('Chocolate, Caramel');
    expect(parsed[1].id).toBe('coffee-2');
  });

  it('handles empty rows in CSV data', () => {
    const store = useProfilesStore();
    
    const csvRows = [
      ['name', 'source', 'notes'],
      ['Coffee 1', 'Ethiopia', 'Floral, Citrus'],
      [], // Empty row
      ['Coffee 2', 'Colombia', 'Chocolate, Caramel']
    ];
    
    const parsed = store.parseRows(csvRows);
    
    expect(parsed.length).toBe(2);
    expect(parsed[0].name).toBe('Coffee 1');
    expect(parsed[1].name).toBe('Coffee 2');
  });
  
  it('handles null or insufficient CSV data', () => {
    const store = useProfilesStore();
    
    // Test with null input
    expect(store.parseRows(null)).toEqual([]);
    
    // Test with empty array
    expect(store.parseRows([])).toEqual([]);
    
    // Test with only headers, no data rows
    expect(store.parseRows([['name', 'source']])).toEqual([]);
  });
  
  it('handles origin field as an alternative to source', () => {
    const store = useProfilesStore();
    
    const csvRows = [
      ['name', 'origin', 'notes'], // Using 'origin' instead of 'source'
      ['Coffee 1', 'Ethiopia', 'Floral, Citrus']
    ];
    
    const parsed = store.parseRows(csvRows);
    
    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Coffee 1');
    expect(parsed[0].origin).toBe('Ethiopia');
    expect(parsed[0].source).toBe('Ethiopia'); // source should be copied from origin
  });

  it('sets source correctly', () => {
    const store = useProfilesStore();
    
    expect(store.selectedSource).toBe('All');
    
    store.setSource('Ethiopia');
    expect(store.selectedSource).toBe('Ethiopia');
  });
});