<template>
  <div id="app" :class="{ 'light-theme': theme === 'light', 'dark-theme': theme === 'dark' }">
    <header>
      <div class="header-container">
        <div class="branding">
          <div class="logo">
            ☕
          </div>
          <h1>Aiden Coffee Profiles</h1>
        </div>
        <div class="header-controls">
          <button
            class="refresh-btn"
            :disabled="loading"
            :class="{ 'loading': loading }"
            @click="refresh"
          >
            <span class="btn-icon">↻</span>
            <span class="btn-text">{{ loading ? 'Refreshing...' : 'Refresh Profiles' }}</span>
          </button>
          <button
            class="download-btn"
            :disabled="downloading"
            :class="{ 'loading': downloading }"
            @click="downloadData"
            title="Download data for offline use"
          >
            <span class="btn-icon">⬇️</span>
            <span class="btn-text">{{ downloading ? `${downloadProgress}%` : 'Download Data' }}</span>
            <div v-if="downloading" class="progress-bar">
              <div class="progress-fill" :style="{ width: `${downloadProgress}%` }"></div>
            </div>
          </button>
          <button 
            class="data-source-toggle" 
            :class="{ 'online': !useLocalData, 'offline': useLocalData }" 
            @click="toggleDataSource"
            :title="useLocalData ? 'Switch to CSV file data' : 'Switch to stored data'"
          >
            {{ useLocalData ? '📁' : '📄' }}
          </button>
          <button class="theme-toggle" :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`" @click="toggleTheme">
            {{ theme === 'light' ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <div>Made for the Aiden Brewer</div>
    </footer>
  </div>
</template>

<script>
import { useProfilesStore } from './store/profiles';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const store = useProfilesStore();
    const { 
      theme, 
      loading, 
      downloading, 
      downloadProgress, 
      useLocalData 
    } = storeToRefs(store);
    
    onMounted(() => {
      // Set initial theme
      document.documentElement.setAttribute('data-theme', theme.value);
      // Fetch initial data
      store.fetchProfiles();
    });
    
    const refresh = () => {
      store.fetchProfiles();
    };
    
    const downloadData = async () => {
      const success = await store.downloadSpreadsheet();
      if (success) {
        // Show success notification or status
        console.log('Data downloaded successfully');
      }
    };
    
    const toggleDataSource = () => {
      store.toggleDataSource();
    };
    
    const toggleTheme = () => {
      store.toggleTheme();
    };
    
    return {
      theme,
      loading,
      downloading,
      downloadProgress,
      useLocalData,
      refresh,
      downloadData,
      toggleDataSource,
      toggleTheme
    };
  }
};
</script>

<style lang="scss">
/* Main CSS variables are defined in assets/main.scss */
@use "sass:color";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: var(--primary-color);
  padding: 1rem;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  color: var(--header-color);
  font-size: 1.8rem;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 1rem;
}

.branding {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-size: 2rem;
  animation: steam 3s infinite ease-in-out;
}

@keyframes steam {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(5deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-5px) rotate(-5deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  background-color: var(--secondary-color);
  color: #333;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

.refresh-btn,
.download-btn {
  min-width: 160px;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &.loading .btn-icon {
    animation: spin 1.5s infinite linear;
  }
}

.download-btn {
  background-color: var(--accent-color);
  color: white;
  position: relative;
  overflow: hidden;
  
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 0 0 30px 30px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: white;
    transition: width 0.3s ease;
  }
  
  &:hover {
    background-color: color.scale(#d9985f, $lightness: -10%);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 1.2rem;
}

.theme-toggle,
.data-source-toggle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  padding: 0;
  background-color: transparent;
  border: 2px solid var(--secondary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: rotate(15deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.data-source-toggle {
  background-color: rgba(0, 0, 0, 0.05);
  
  &.online {
    border-color: #4CAF50;
    color: #4CAF50;
  }
  
  &.offline {
    border-color: #607D8B;
    color: #607D8B;
  }
}

footer {
  text-align: center;
  padding: 2rem 0;
  color: var(--secondary-color);
  font-size: 0.9rem;
  opacity: 0.8;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-controls {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .refresh-btn,
  .download-btn {
    flex: 1;
    min-width: 0;
    
    .btn-text {
      font-size: 0.85rem;
    }
  }
}
</style>