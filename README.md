# Aiden Coffee Profiles

A modern web application for viewing and filtering coffee brewing profiles optimized for the Aiden brewer. Browse coffee profiles by origin/source, view detailed brewing parameters, and enjoy a responsive design with light/dark theme support.

![Aiden Coffee Profiles App Screenshot](/public/aiden_screenshot.jpg)

## Features

- Display coffee profiles with detailed brewing parameters
- Filter profiles by origin/source
- Light/dark theme toggle with persistent user preference
- Responsive design for desktop, tablet, and mobile
- Download data for offline use with visual progress indicator
- Toggle between online and offline data sources
- Automatic fallback from online → local → sample data
- Comprehensive error handling with retry options
- Last updated timestamp display

## Table of Contents

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Linux / macOS](#linux--macos)
  - [Windows](#windows)
  - [Windows (WSL2)](#windows-wsl2)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Linting](#linting)
- [Configuration](#configuration)
- [Data Source](#data-source)
- [Project Structure](#project-structure)
- [License](#license)
- [Credits](#credits)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or Yarn (v1.22 or higher)
- Git

### Linux / macOS

1. Open Terminal
2. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/aiden-profiles.git
   cd aiden-profiles
   ```

3. Install dependencies:

   ```bash
   # Using npm
   npm install

   # OR using Yarn
   yarn install
   ```

4. Start the development server:

   ```bash
   # Using npm
   npm run dev

   # OR using Yarn
   yarn dev
   ```

5. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

### Windows

1. Open Command Prompt or PowerShell
2. Clone the repository:

   ```powershell
   git clone https://github.com/yourusername/aiden-profiles.git
   cd aiden-profiles
   ```

3. Install dependencies:

   ```powershell
   # Using npm
   npm install

   # OR using Yarn
   yarn install
   ```

4. Start the development server:

   ```powershell
   # Using npm
   npm run dev

   # OR using Yarn
   yarn dev
   ```

5. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

### Windows (WSL2)

1. Install WSL2 by opening PowerShell as Administrator and running:

   ```powershell
   wsl --install
   ```

2. Restart your computer and follow the Ubuntu setup process
3. Open Ubuntu terminal
4. Install Node.js and npm:

   ```bash
   sudo apt update
   sudo apt install nodejs npm

   # Upgrade to latest Node.js using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   ```

5. Install Yarn (optional):

   ```bash
   npm install --global yarn
   ```

6. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/aiden-profiles.git
   cd aiden-profiles
   ```

7. Install dependencies:

   ```bash
   # Using npm
   npm install

   # OR using Yarn
   yarn install
   ```

8. Start the development server:

   ```bash
   # Using npm
   npm run dev

   # OR using Yarn
   yarn dev
   ```

9. Open your browser in Windows and navigate to [http://localhost:5173](http://localhost:5173)

## Development

During development, you can use the following commands:

```bash
# Start development server with hot-reload
npm run dev
# OR
yarn dev

# Run tests
npm test
# OR
yarn test

# Run tests in watch mode
npm run test:watch
# OR
yarn test:watch

# Lint code
npm run lint
# OR
yarn lint

# Automatically fix lint issues
npm run lint:fix
# OR
yarn lint:fix
```

### Platform-Specific Development Tips

#### Linux

- For Ubuntu/Debian: Install build essentials if you encounter compilation issues:
  ```bash
  sudo apt install build-essential
  ```

#### macOS

- Install Xcode Command Line Tools if you encounter compilation issues:
  ```bash
  xcode-select --install
  ```
- Use Homebrew to install Node.js and Yarn:
  ```bash
  brew install node yarn
  ```

#### Windows

- Make sure you have the Windows Build Tools installed for npm:
  ```powershell
  npm install --global --production windows-build-tools
  ```
- Consider using WSL2 for a more Linux-like development experience

#### WSL2

- For GUI apps like browsers, use Windows browsers
- Enable the Windows Firewall to allow connections from WSL2
- Use VS Code's Remote WSL extension for a seamless experience

## Building for Production

To build the application for production:

```bash
# Build the app
npm run build
# OR
yarn build

# Preview the production build locally with Vite
npm run preview
# OR
yarn preview

# Serve the production build with 'serve' package
npm run serve
# OR
yarn serve

# Build and immediately serve (all-in-one command)
npm run build:serve
# OR
yarn build:serve
```

The production build will be created in the `dist` directory.

## Testing

The project includes comprehensive unit tests for components and stores with a visual dashboard for monitoring progress and results:

```bash
# Run tests once
npm test
# OR
yarn test

# Run tests with visual dashboard
npm run test:dash
# OR
yarn test:dash

# Run tests with detailed summary report
npm run test:full
# OR
yarn test:full

# Run tests in watch mode
npm run test:watch
# OR
yarn test:watch

# Run tests with coverage report
npm run test:coverage
# OR
yarn test:coverage
```

The test dashboard provides:

- Visual progress spinner while tests are running 🔄
- Detailed statistics about test runs 📊
- Pass/fail status with a visual progress bar 📈
- Coffee-themed ASCII art that changes color based on results ☕
- Clear pass/fail summary 🎯

## Linting

We use ESLint for code quality and consistency:

```bash
# Run linter
npm run lint
# OR
yarn lint

# Automatically fix lint issues
npm run lint:fix
# OR
yarn lint:fix
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory for custom environment variables:

```
VITE_API_URL=https://your-api-url.com
```

### Vite Config

The application uses Vite for fast development and optimized builds. Configuration options can be found in `vite.config.js`.

## Data Source

The application is designed to fetch coffee profiles from a Google Spreadsheet with offline capabilities:

1. **Online Data:** Fetches coffee profiles directly from a Google Spreadsheet published as CSV
2. **Offline Data:** Uses locally stored data (downloaded from the spreadsheet)
3. **Sample Data:** Falls back to built-in sample data if network or storage is unavailable

### Data Source Configuration

The application includes a local CSV file for data and supports two data modes: direct CSV access and browser-stored data.

#### Understanding CORS Limitations

When developing web applications, direct requests to external services like Google Sheets are typically blocked by browsers due to Cross-Origin Resource Sharing (CORS) policies. For this reason:

- The app uses a local CSV file located at `/public/data/coffee-profiles.csv`
- The data source toggle demonstrates the concept of switching between different data sources
- In a production environment, you would use a backend proxy or serverless function to access Google Sheets

#### Local Development Mode

For local development, the app includes:

1. **CSV File Data Mode**: Reads directly from the included CSV file
2. **Stored Data Mode**: Uses data that has been stored in the browser's localStorage

#### Production Implementation

To use Google Sheets in a production environment:

1. Create a backend proxy (using Node.js, serverless functions, etc.)
2. Configure the proxy to fetch data from Google Sheets
3. Have your application fetch from your proxy instead of directly from Google Sheets
4. Update the constants file:
   ```javascript
   // In src/config/constants.js
   const API_ENDPOINT = "https://your-backend-api.com/coffee-profiles";
   export const COFFEE_PROFILES_SPREADSHEET_URL = API_ENDPOINT;
   ```

**Why This Approach Is Necessary:**

- Browser security prevents direct CORS requests to Google Sheets
- A backend proxy can add the proper headers and handle authentication
- This pattern is standard for web applications that need to access third-party APIs

#### CSV Format Requirements

Make sure your CSV follows the expected data structure as outlined below.

### Offline Functionality

The app includes a built-in download feature that:

- Downloads and stores the spreadsheet data locally
- Shows download progress in real-time
- Allows switching between online and offline data sources
- Automatically falls back to offline data if online fetch fails

### Data Structure

Your spreadsheet should have these columns:

- `name`: Coffee name (e.g., "Ethiopia Yirgacheffe")
- `source`: Coffee origin/country (e.g., "Ethiopia")
- `roast`: Roast level (e.g., "Light", "Medium", "Dark")
- `process`: Processing method (e.g., "Washed", "Natural", "Honey")
- `variety`: Coffee variety (e.g., "Heirloom", "Bourbon")
- `altitude`: Growing altitude (e.g., "1800-2200m")
- `notes`: Flavor notes, comma-separated (e.g., "Floral, Citrus, Bergamot")
- `description`: Text description of the coffee
- `temperature`: Brewing temperature (e.g., "92°C")
- `grind_size`: Recommended grind size (e.g., "Medium-Fine")
- `brew_ratio`: Coffee-to-water ratio (e.g., "1:16")
- `brew_time`: Recommended brewing time (e.g., "3:30")

Your local CSV file is located at `public/data/coffee-profiles.csv`. You can edit this file directly to add or modify coffee profiles.

## Project Structure

```
aiden-profiles/
├── public/              # Static assets
├── src/                 # Source code
│   ├── assets/          # CSS, SCSS, and other assets
│   ├── components/      # Vue components
│   ├── router/          # Vue Router configuration
│   ├── store/           # Pinia stores
│   ├── utils/           # Utility functions
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── tests/               # Test files
│   └── unit/            # Unit tests
├── .eslintrc.js         # ESLint configuration
├── index.html           # HTML template
├── LICENSE              # MIT License
├── package.json         # Project dependencies and scripts
├── README.md            # Project documentation
├── vite.config.js       # Vite configuration
└── vitest.config.js     # Vitest configuration
```

## Recent Improvements

- Implemented a robust data handling system with multiple modes
- Added CSV data parsing capabilities for structured coffee profile data
- Created data download and storage functionality for offline use
- Added visual progress indicators for data operations
- Implemented data source toggle for switching between data modes
- Added visual indicators for current data source with profile counts
- Enhanced error handling with multiple fallback methods
- Improved code organization with utility files and constants
- Implemented comprehensive unit tests with CSV data validation
- Added persistent theme and data preferences with localStorage
- Improved mobile responsiveness
- Enhanced documentation with detailed technical explanations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Coffee icons: [Coffee Icons](https://www.flaticon.com/free-icons/coffee)
- Design inspiration: [Coffee Brewing Guides](https://coffeebrowsing.com/brewing-guides)
- Built with [Vue 3](https://vuejs.org/) and [Pinia](https://pinia.vuejs.org/)
- Testing with [Vitest](https://vitest.dev/) and [Vue Test Utils](https://test-utils.vuejs.org/)
