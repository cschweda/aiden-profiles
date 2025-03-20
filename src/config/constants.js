/**
 * Application constants
 */

// Coffee profiles data source
// You can either use:
// 1. A Google Sheets URL (recommended for production)
// 2. A local CSV file path (included for development)

// Option 1: Google Sheets URL (disabled due to CORS issues in browser environment)
// This URL would work in a server environment but not directly in the browser
export const REMOTE_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1mi-YS6JYfbX3wN1kZd6iu_q6mFlWM4Ah6N3Ox8eqRCA/export?format=csv&gid=0';

// Option 2: Local CSV file path (primary source)
export const LOCAL_CSV_PATH = '/data/coffee-profiles.csv';

// For browser environments, we need to use the local file to avoid CORS issues
// In a full production environment, you would use a server-side proxy to fetch the Google Sheet
export const COFFEE_PROFILES_SPREADSHEET_URL = LOCAL_CSV_PATH;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LAST_UPDATED: 'last_updated',
  LOCAL_PROFILES: 'local_profiles',
  USE_LOCAL_DATA: 'use_local_data'
};

// API settings
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds timeout for API requests
  RETRY_COUNT: 2  // Number of times to retry failed requests
};

// Default settings
export const DEFAULT_SETTINGS = {
  THEME: 'dark',
  USE_LOCAL_DATA: false
};