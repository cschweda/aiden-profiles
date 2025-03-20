// Global test setup
import { vi } from 'vitest';

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock console.error to avoid test output noise
console.error = vi.fn();

// Add any other global mocks or setup needed for tests