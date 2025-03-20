<template>
  <div class="home">
    <div class="filter-container">
      <label for="source-filter">Filter by source:</label>
      <select 
        id="source-filter" 
        v-model="selectedSource" 
        @change="filterBySource"
      >
        <option v-for="source in sources" :key="source" :value="source">
          {{ source }}
        </option>
      </select>
    </div>
    
    <div v-if="loading || error" class="loading-error">
      <div v-if="loading" class="loading">
        Loading profiles...
      </div>
      <div v-if="error" class="error">
        <p>{{ error }}</p>
        <button class="retry-button" @click="retryLoad">
          Try Again
        </button>
      </div>
    </div>
    
    <div v-else class="profiles-container">
      <div class="info-bar">
        <div v-if="lastUpdated" class="last-updated">
          <span>Last updated: {{ formattedLastUpdated }}</span>
        </div>
        <div class="data-source-indicator">
          <span v-if="useLocalData" class="local-data">
            📁 Using stored data
            <span v-if="profiles.length" class="data-source-count">({{ profiles.length }} profiles)</span>
          </span>
          <span v-else class="online-data">
            📄 Using CSV file
            <span v-if="profiles.length" class="data-source-count">({{ profiles.length }} profiles)</span>
            <span class="cors-note">*Google Sheets connection disabled due to CORS</span>
          </span>
        </div>
      </div>
      
      <div class="profiles-grid">
        <ProfileCard 
          v-for="profile in filteredProfiles" 
          :key="profile.id || profile.name" 
          :profile="profile" 
        />
        
        <div v-if="filteredProfiles.length === 0" class="no-profiles">
          No coffee profiles found. Try a different filter or refresh the data.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useProfilesStore } from '@/store/profiles';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import ProfileCard from '@/components/ProfileCard.vue';

export default {
  name: 'HomeView',
  components: {
    ProfileCard
  },
  setup() {
    const store = useProfilesStore();
    const { 
      filteredProfiles, 
      loading, 
      error, 
      sources, 
      selectedSource,
      lastUpdated,
      useLocalData,
      profiles
    } = storeToRefs(store);
    
    const filterBySource = () => {
      store.setSource(selectedSource.value);
    };
    
    const retryLoad = () => {
      store.fetchProfiles();
    };

    const formattedLastUpdated = computed(() => {
      if (!lastUpdated.value) return '';
      
      try {
        const date = new Date(lastUpdated.value);
        return date.toLocaleString();
      } catch (error) {
        return lastUpdated.value;
      }
    });
    
    return {
      filteredProfiles,
      loading,
      error,
      sources,
      selectedSource,
      lastUpdated,
      useLocalData,
      profiles,
      formattedLastUpdated,
      filterBySource,
      retryLoad
    };
  }
};
</script>

<style scoped lang="scss">
@use "sass:color";
.home {
  width: 100%;
}

.filter-container {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--card-background);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  label {
    font-weight: 600;
    color: var(--secondary-color);
  }
  
  select {
    padding: 0.5rem 1rem;
    border-radius: 30px;
    border: 2px solid var(--secondary-color);
    background-color: var(--card-background);
    color: var(--text-color);
    min-width: 180px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(217, 152, 95, 0.2);
    }
    
    &:hover {
      border-color: var(--accent-color);
    }
    
    option {
      background-color: var(--card-background);
      color: var(--text-color);
      padding: 0.5rem;
    }
  }
}

.profiles-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.last-updated {
  font-size: 0.85rem;
  color: var(--secondary-color);
  opacity: 0.8;
  padding: 0 0.5rem;
}

.data-source-indicator {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
  background-color: var(--card-background);
  box-shadow: 0 2px 4px var(--shadow-color);
  
  .local-data {
    color: #607D8B;
  }
  
  .online-data {
    color: #4CAF50;
  }
  
  .data-source-count {
    margin-left: 4px;
    font-size: 0.75rem;
    opacity: 0.8;
  }
  
  .cors-note {
    display: block;
    font-size: 0.7rem;
    opacity: 0.7;
    font-style: italic;
    margin-top: 2px;
  }
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.loading-error {
  text-align: center;
  padding: 3rem;
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  .loading {
    font-size: 1.3rem;
    color: var(--secondary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    
    &::before {
      content: "☕";
      font-size: 1.8rem;
      animation: pulse 1.5s infinite ease-in-out;
    }
  }
  
  .error {
    color: #e74c3c;
    padding: 1.5rem;
    border-radius: 8px;
    background-color: rgba(231, 76, 60, 0.1);
    margin-top: 1.5rem;
    border: 1px solid rgba(231, 76, 60, 0.2);
    
    p {
      margin-bottom: 1rem;
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .retry-button {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: color.scale(#e74c3c, $lightness: -10%);
    }
  }
}

.no-profiles {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color);
  opacity: 0.7;
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .profiles-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
    
    select {
      width: 100%;
    }
  }
  
  .info-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .last-updated {
    text-align: left;
  }
  
  .data-source-indicator {
    width: 100%;
    text-align: center;
  }
}
</style>