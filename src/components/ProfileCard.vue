<template>
  <div class="profile-card">
    <div class="profile-header" :class="roastClass">
      <div class="header-content">
        <h2 class="profile-title">
          {{ profile.name || 'Unnamed Coffee' }}
        </h2>
        <div class="profile-source">
          {{ profile.source || profile.origin || 'Unknown Source' }}
        </div>
      </div>
      <div v-if="profile.roast" class="profile-badge">
        {{ profile.roast }}
      </div>
    </div>
    
    <div class="profile-details">
      <div v-if="profile.notes || profile.flavor_notes" class="flavor-notes">
        <div class="notes-label">
          Flavor Notes
        </div>
        <div class="notes-tags">
          <span v-for="(note, index) in flavorNotesArray" :key="index" class="note-tag">
            {{ note }}
          </span>
        </div>
      </div>
      
      <div v-if="profile.description" class="profile-detail">
        <span class="detail-value description">{{ profile.description }}</span>
      </div>
      
      <div class="coffee-specs">
        <div v-if="profile.process" class="spec-item">
          <div class="spec-label">
            Process
          </div>
          <div class="spec-value">
            {{ profile.process }}
          </div>
        </div>
        
        <div v-if="profile.variety || profile.varietal" class="spec-item">
          <div class="spec-label">
            Variety
          </div>
          <div class="spec-value">
            {{ profile.variety || profile.varietal }}
          </div>
        </div>
        
        <div v-if="profile.altitude" class="spec-item">
          <div class="spec-label">
            Altitude
          </div>
          <div class="spec-value">
            {{ profile.altitude }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="hasBrewing" class="brewing-params">
      <h3>Aiden Brewing Parameters</h3>
      
      <div class="brewing-grid">
        <div v-if="profile.temperature" class="brewing-param">
          <div class="param-icon">
            🌡️
          </div>
          <div class="param-content">
            <span class="param-label">Temperature</span>
            <span class="param-value">{{ profile.temperature }}</span>
          </div>
        </div>
        
        <div v-if="profile.ratio || profile.brew_ratio" class="brewing-param">
          <div class="param-icon">
            ⚖️
          </div>
          <div class="param-content">
            <span class="param-label">Ratio</span>
            <span class="param-value">{{ profile.ratio || profile.brew_ratio }}</span>
          </div>
        </div>
        
        <div v-if="profile.grind_size" class="brewing-param">
          <div class="param-icon">
            ☕
          </div>
          <div class="param-content">
            <span class="param-label">Grind Size</span>
            <span class="param-value">{{ profile.grind_size }}</span>
          </div>
        </div>
        
        <div v-if="profile.brew_time" class="brewing-param">
          <div class="param-icon">
            ⏱️
          </div>
          <div class="param-content">
            <span class="param-label">Brew Time</span>
            <span class="param-value">{{ profile.brew_time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'ProfileCard',
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const hasBrewing = computed(() => {
      return props.profile.temperature || 
        props.profile.ratio || 
        props.profile.brew_ratio || 
        props.profile.grind_size || 
        props.profile.brew_time;
    });
    
    const flavorNotesArray = computed(() => {
      const notes = props.profile.notes || props.profile.flavor_notes || '';
      return notes.split(/,\s*/).filter(note => note.trim());
    });
    
    const roastClass = computed(() => {
      const roast = props.profile.roast?.toLowerCase() || '';
      if (roast.includes('light')) return 'roast-light';
      if (roast.includes('medium')) return 'roast-medium';
      if (roast.includes('dark')) return 'roast-dark';
      return '';
    });
    
    return {
      hasBrewing,
      flavorNotesArray,
      roastClass
    };
  }
};
</script>

<style scoped lang="scss">
.profile-card {
  background-color: var(--card-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px var(--shadow-color);
  }
}

.profile-header {
  padding: 1.5rem;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  &.roast-light {
    background: linear-gradient(135deg, #c8a27e, #d9985f);
  }
  
  &.roast-medium {
    background: linear-gradient(135deg, #8a5a44, #c8a27e);
  }
  
  &.roast-dark {
    background: linear-gradient(135deg, #4a3728, #8a5a44);
  }
}

.header-content {
  flex: 1;
}

.profile-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.35rem 0.75rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profile-source {
  font-size: 1rem;
  opacity: 0.8;
}

.profile-details {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.flavor-notes {
  margin-bottom: 0.5rem;
}

.notes-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--secondary-color);
}

.notes-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.note-tag {
  background-color: var(--accent-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 500;
}

.description {
  line-height: 1.5;
  font-style: italic;
  opacity: 0.9;
}

.coffee-specs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--secondary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.spec-value {
  font-size: 1rem;
}

.brewing-params {
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    color: var(--secondary-color);
    text-align: center;
  }
}

.brewing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 1rem;
}

.brewing-param {
  display: flex;
  align-items: center;
  
  .param-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }
  
  .param-content {
    display: flex;
    flex-direction: column;
  }
  
  .param-label {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--secondary-color);
    margin-bottom: 0.1rem;
  }
  
  .param-value {
    font-size: 1rem;
  }
}

[data-theme="light"] .brewing-params {
  background-color: rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

@media (max-width: 400px) {
  .brewing-grid {
    grid-template-columns: 1fr;
  }
}
</style>