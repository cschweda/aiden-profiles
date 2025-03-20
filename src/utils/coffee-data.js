/**
 * @typedef {Object} CoffeeProfile
 * @property {string} id - Unique identifier for the coffee profile
 * @property {string} name - Name of the coffee
 * @property {string} source - Country of origin
 * @property {string} roast - Roast level (Light, Medium, Dark, etc.)
 * @property {string} process - Processing method (Washed, Natural, etc.)
 * @property {string} variety - Coffee variety
 * @property {string} altitude - Growing altitude
 * @property {string} notes - Flavor notes
 * @property {string} description - Text description
 * @property {string} temperature - Brewing temperature
 * @property {string} grind_size - Recommended grind size
 * @property {string} brew_ratio - Coffee-to-water ratio
 * @property {string} brew_time - Recommended brewing time
 */

/**
 * Sample coffee profiles for demo purposes
 * @type {CoffeeProfile[]}
 */
export const sampleCoffeeProfiles = [
  {
    id: 'coffee-1',
    name: 'Ethiopia Yirgacheffe',
    source: 'Ethiopia',
    roast: 'Light',
    process: 'Washed',
    variety: 'Heirloom',
    altitude: '1800-2200m',
    notes: 'Floral, Citrus, Bergamot',
    description: 'Bright and complex coffee with floral notes and citrus acidity',
    temperature: '92°C',
    grind_size: 'Medium-Fine',
    brew_ratio: '1:16',
    brew_time: '3:30'
  },
  {
    id: 'coffee-2',
    name: 'Colombia Huila',
    source: 'Colombia',
    roast: 'Medium',
    process: 'Washed',
    variety: 'Caturra, Castillo',
    altitude: '1600-1900m',
    notes: 'Chocolate, Caramel, Red Apple',
    description: 'Sweet and balanced with chocolate notes and medium body',
    temperature: '94°C',
    grind_size: 'Medium',
    brew_ratio: '1:15',
    brew_time: '3:45'
  },
  {
    id: 'coffee-3',
    name: 'Guatemala Antigua',
    source: 'Guatemala',
    roast: 'Medium',
    process: 'Washed',
    variety: 'Bourbon',
    altitude: '1500-1700m',
    notes: 'Chocolate, Spice, Orange',
    description: 'Rich body with chocolate and subtle orange notes',
    temperature: '93°C',
    grind_size: 'Medium',
    brew_ratio: '1:15.5',
    brew_time: '3:30'
  },
  {
    id: 'coffee-4',
    name: 'Kenya AA',
    source: 'Kenya',
    roast: 'Medium-Light',
    process: 'Washed',
    variety: 'SL28, SL34',
    altitude: '1700-1900m',
    notes: 'Blackcurrant, Grapefruit, Brown Sugar',
    description: 'Vibrant acidity with fruity notes and a sweet finish',
    temperature: '94°C',
    grind_size: 'Medium-Fine',
    brew_ratio: '1:16',
    brew_time: '3:15'
  },
  {
    id: 'coffee-5',
    name: 'Costa Rica Tarrazu',
    source: 'Costa Rica',
    roast: 'Medium',
    process: 'Honey',
    variety: 'Caturra',
    altitude: '1500-1800m',
    notes: 'Honey, Stone Fruit, Hazelnut',
    description: 'Sweet and smooth with a honey-like sweetness and nutty finish',
    temperature: '93°C',
    grind_size: 'Medium',
    brew_ratio: '1:16',
    brew_time: '3:30'
  },
  {
    id: 'coffee-6',
    name: 'Brazil Cerrado',
    source: 'Brazil',
    roast: 'Medium-Dark',
    process: 'Natural',
    variety: 'Mundo Novo, Catuai',
    altitude: '1000-1200m',
    notes: 'Chocolate, Nut, Caramel',
    description: 'Low acidity with chocolate notes and nutty undertones',
    temperature: '92°C',
    grind_size: 'Medium-Coarse',
    brew_ratio: '1:15',
    brew_time: '4:00'
  },
  {
    id: 'coffee-7',
    name: 'Indonesia Sumatra Mandheling',
    source: 'Indonesia',
    roast: 'Dark',
    process: 'Wet-Hulled',
    variety: 'Typica, Catimor',
    altitude: '900-1500m',
    notes: 'Earthy, Cedar, Dark Chocolate',
    description: 'Full-bodied with earthy notes and low acidity',
    temperature: '91°C',
    grind_size: 'Medium-Coarse',
    brew_ratio: '1:14',
    brew_time: '4:15'
  },
  {
    id: 'coffee-8',
    name: 'Panama Gesha',
    source: 'Panama',
    roast: 'Light',
    process: 'Washed',
    variety: 'Gesha',
    altitude: '1600-1800m',
    notes: 'Jasmine, Bergamot, Peach',
    description: 'Delicate and tea-like with floral aromas and juicy acidity',
    temperature: '94°C',
    grind_size: 'Medium-Fine',
    brew_ratio: '1:17',
    brew_time: '3:15'
  }
];

/**
 * Parse CSV rows into coffee profile objects
 * @param {Array<Array<string>>} rows - CSV data as array of arrays
 * @returns {CoffeeProfile[]} - Parsed coffee profiles
 */
export const parseCSVRows = (rows) => {
  if (!rows || rows.length < 2) return [];
  
  const headers = rows[0].map(header => header.trim().toLowerCase().replace(/\s+/g, '_'));
  const result = [];
  
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].length) continue;
    
    const profile = {};
    headers.forEach((header, index) => {
      profile[header] = (rows[i][index] || '').trim();
    });
    
    // Ensure the source field exists
    if (!profile.source && profile.origin) {
      profile.source = profile.origin;
    }
    
    // Add a unique ID if missing
    if (!profile.id) {
      profile.id = `coffee-${i}`;
    }
    
    result.push(profile);
  }
  
  return result;
};

/**
 * Extract unique sources from coffee profiles
 * @param {CoffeeProfile[]} profiles - Coffee profile objects
 * @returns {string[]} - Array of unique sources with 'All' option first
 */
export const extractUniqueSources = (profiles) => {
  const uniqueSources = [...new Set(profiles.map(profile => profile.source))].filter(Boolean);
  return ['All', ...uniqueSources];
};