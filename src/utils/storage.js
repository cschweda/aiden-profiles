/**
 * Storage utility functions for persistent data
 */

/**
 * Get an item from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} - Stored value or default
 */
export const getStorageItem = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.warn(`Error reading from localStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * Store an item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Error writing to localStorage: ${error}`);
  }
};

/**
 * Get a JSON object from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} - Parsed object or default
 */
export const getStorageJSON = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`Error parsing from localStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * Store a JSON object in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Object to store
 */
export const setStorageJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error stringifying to localStorage: ${error}`);
  }
};