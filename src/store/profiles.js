import { defineStore } from 'pinia';
import axios from 'axios';
import { sampleCoffeeProfiles, parseCSVRows, extractUniqueSources } from '@/utils/coffee-data';
import { getStorageItem, setStorageItem, getStorageJSON, setStorageJSON } from '@/utils/storage';
import { 
  COFFEE_PROFILES_SPREADSHEET_URL, 
  REMOTE_SPREADSHEET_URL,
  LOCAL_CSV_PATH,
  STORAGE_KEYS, 
  DEFAULT_SETTINGS 
} from '@/config/constants';

/**
 * Pinia store for coffee profiles
 */
export const useProfilesStore = defineStore('profiles', {
  /**
   * State for the profiles store
   */
  state: () => ({
    profiles: [],
    loading: false,
    error: null,
    sources: [],
    selectedSource: 'All',
    theme: getStorageItem(STORAGE_KEYS.THEME, DEFAULT_SETTINGS.THEME),
    lastUpdated: getStorageItem(STORAGE_KEYS.LAST_UPDATED, null),
    downloading: false,
    downloadError: null,
    downloadProgress: 0,
    useLocalData: getStorageItem(STORAGE_KEYS.USE_LOCAL_DATA, DEFAULT_SETTINGS.USE_LOCAL_DATA) === 'true',
    spreadsheetUrl: COFFEE_PROFILES_SPREADSHEET_URL,
    onlineDataAvailable: false
  }),
  
  /**
   * Getters for computed values
   */
  getters: {
    /**
     * Get profiles filtered by selected source
     * @returns {Array} Filtered coffee profiles
     */
    filteredProfiles: (state) => {
      if (state.selectedSource === 'All') {
        return state.profiles;
      }
      return state.profiles.filter(profile => profile.source === state.selectedSource);
    },
    
    /**
     * Check if any profiles are available
     * @returns {boolean} True if profiles exist
     */
    hasProfiles: (state) => {
      return state.profiles.length > 0;
    }
  },
  
  /**
   * Actions for state mutations
   */
  actions: {
    /**
     * Fetch coffee profiles from external source
     * Falls back to local data or sample data if fetch fails
     */
    async fetchProfiles() {
      this.loading = true;
      this.error = null;
      
      try {
        // Check if we should use locally stored data
        const localProfiles = getStorageJSON(STORAGE_KEYS.LOCAL_PROFILES);
        
        // If using local data & it exists, load it
        if (this.useLocalData && localProfiles) {
          // Use locally stored data if available and preferred
          this.profiles = localProfiles;
          this.sources = extractUniqueSources(this.profiles);
          console.log('Using locally stored profiles data');
        } else {
          // Try to fetch data from CSV (local file in both cases due to CORS)
          try {
            // Due to CORS limitations in the browser, we have to use the local CSV file for both sources
            // In a production environment with a server-side proxy, you would use different URLs here
            console.log(`Fetching profiles from local CSV file (${this.useLocalData ? 'stored version' : 'fresh read'})`);
            
            // Just get the local CSV file
            const response = await axios.get(LOCAL_CSV_PATH, {
              timeout: 5000
            });
            
            // Log response info for debugging
            console.log(`Response status: ${response.status}`);
            console.log(`Response size: ${response.data ? response.data.length : 0} bytes`);
            
            const csvData = response.data;
            
            if (!csvData || typeof csvData !== 'string') {
              throw new Error(`Invalid CSV data received: ${typeof csvData}`);
            }
            
            // Parse CSV data
            const rows = this.parseCSV(csvData);
            
            if (rows.length < 2) {
              console.error('Not enough rows in CSV data', rows);
              throw new Error('Invalid CSV data: Not enough rows');
            }
            
            console.log(`Found ${rows.length} rows in CSV`);
            
            this.profiles = this.parseRows(rows);
            console.log(`Parsed ${this.profiles.length} coffee profiles`);
            
            if (this.profiles.length > 0) {
              // Mark that online data is available (for UI indication)
              if (!this.useLocalData) {
                this.onlineDataAvailable = true;
              }
              
              // If this was an online fetch, store it locally too
              if (!this.useLocalData) {
                setStorageJSON(STORAGE_KEYS.LOCAL_PROFILES, this.profiles);
                console.log('Saved remote data to local storage');
              }
              
              this.sources = extractUniqueSources(this.profiles);
              
              // Store the last updated time
              this.lastUpdated = new Date().toISOString();
              setStorageItem(STORAGE_KEYS.LAST_UPDATED, this.lastUpdated);
              
              console.log(`Successfully loaded ${this.profiles.length} profiles`);
            } else {
              throw new Error('No profiles found in the data');
            }
          } catch (fetchError) {
            console.error('Error fetching data:', fetchError);
            
            // Try to use locally stored data as first fallback
            if (localProfiles && localProfiles.length > 0) {
              this.profiles = localProfiles;
              this.sources = extractUniqueSources(this.profiles);
              this.error = `Failed to fetch data. Using locally stored data. (${fetchError.message})`;
              console.log('Using locally stored profiles as fallback');
            } else {
              // Use sample data as final fallback
              this.loadSampleData();
              this.error = `Failed to fetch data. Using sample data. (${fetchError.message})`;
              console.log('Using sample data profiles as fallback');
            }
          }
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch profiles';
        console.error('Error in fetchProfiles:', error);
        this.loadSampleData();
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Improved CSV parser that handles different line endings and potential issues
     * @param {string} csvText - CSV text to parse
     * @returns {Array} Array of arrays (rows and columns)
     */
    parseCSV(csvText) {
      if (!csvText || typeof csvText !== 'string') {
        console.error('Invalid CSV data received:', csvText);
        return [];
      }
      
      try {
        // Log the first part of the CSV for debugging
        console.log('CSV data sample:', csvText.substring(0, 100) + '...');
        
        // Handle both Windows (\r\n) and Unix (\n) line endings
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
          console.error('No valid lines found in CSV');
          return [];
        }
        
        console.log(`Found ${lines.length} lines in CSV`);
        
        // Process each line
        return lines.map((line, index) => {
          // Handle quoted values with commas inside them
          const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
          const matches = line.match(regex) || [];
          
          if (index === 0) {
            console.log('CSV headers:', matches);
          }
          
          // Remove quotes from quoted values
          return matches.map(value => 
            value.startsWith('"') && value.endsWith('"') 
              ? value.substring(1, value.length - 1) 
              : value
          );
        });
      } catch (error) {
        console.error('Error parsing CSV:', error);
        return [];
      }
    },
    
    /**
     * Download the local CSV file and save it to local storage
     * 
     * Note: In a production environment with a server-side proxy,
     * this would fetch from Google Sheets instead
     */
    async downloadSpreadsheet() {
      this.downloading = true;
      this.downloadError = null;
      this.downloadProgress = 0;
      
      try {
        console.log(`Downloading profiles from local CSV file (CORS prevents direct Google Sheets access)`);
        
        // Simulate a slower download to demonstrate the progress bar
        await new Promise(resolve => setTimeout(resolve, 500));
        this.downloadProgress = 25;
        
        // Fetch the CSV data from the local file (in production, this would be from Google Sheets via a proxy)
        const response = await axios.get(LOCAL_CSV_PATH, {
          timeout: 5000,
          onDownloadProgress: (progressEvent) => {
            // Calculate and update download progress
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            this.downloadProgress = percentCompleted;
          }
        });
        
        const csvData = response.data;
        
        if (!csvData || typeof csvData !== 'string') {
          throw new Error(`Invalid CSV data received: ${typeof csvData}`);
        }
        
        console.log(`Downloaded ${csvData.length} bytes of CSV data`);
        
        // Parse the CSV data
        const rows = this.parseCSV(csvData);
        
        if (rows.length < 2) {
          throw new Error('Not enough rows in CSV data');
        }
        
        const profiles = this.parseRows(rows);
        
        if (profiles.length === 0) {
          throw new Error('No profiles parsed from CSV data');
        }
        
        console.log(`Successfully parsed ${profiles.length} profiles`);
        
        // Save to local storage
        setStorageJSON(STORAGE_KEYS.LOCAL_PROFILES, profiles);
        console.log('Saved profiles to local storage');
        
        // Update the last updated time
        const now = new Date().toISOString();
        setStorageItem(STORAGE_KEYS.LAST_UPDATED, now);
        this.lastUpdated = now;
        
        // Mark that we have online data available
        this.onlineDataAvailable = true;
        
        // Update profiles if we're using local data
        if (this.useLocalData) {
          this.profiles = profiles;
          this.sources = extractUniqueSources(this.profiles);
        }
        
        console.log(`Successfully downloaded and saved ${profiles.length} profiles`);
        this.downloadProgress = 100;
        
        // Reset progress after a delay
        setTimeout(() => {
          this.downloadProgress = 0;
        }, 2000);
        
        return true;
      } catch (error) {
        this.downloadError = error.message || 'Failed to download profiles';
        console.error('Error downloading profiles:', error);
        return false;
      } finally {
        this.downloading = false;
      }
    },
    
    /**
     * Toggle between different data sources
     * Note: Due to CORS limitations, both options now use the local CSV file,
     * but in different ways to demonstrate the concept
     */
    toggleDataSource() {
      this.useLocalData = !this.useLocalData;
      setStorageItem(STORAGE_KEYS.USE_LOCAL_DATA, this.useLocalData.toString());
      
      // In a browser environment without a proxy, both data sources use the local CSV file
      // In a real production environment, the online source would use the Google Sheet via a server proxy
      if (this.useLocalData) {
        console.log('Switched to LOCAL data source (stored in browser)');
      } else {
        console.log('Switched to LOCAL CSV file (simulating online data)');
      }
      
      this.fetchProfiles();
    },
    
    /**
     * Load sample data for demo purposes
     */
    loadSampleData() {
      this.profiles = sampleCoffeeProfiles;
      this.sources = extractUniqueSources(this.profiles);
    },
    
    /**
     * Set the selected source for filtering
     * @param {string} source - Source to filter by
     */
    setSource(source) {
      this.selectedSource = source;
    },
    
    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      setStorageItem(STORAGE_KEYS.THEME, this.theme);
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    
    /**
     * Parse CSV rows into coffee profile objects
     * @param {Array} rows - CSV data as array of arrays
     * @returns {Array} - Parsed coffee profiles
     */
    parseRows(rows) {
      return parseCSVRows(rows);
    }
  }
});