import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import HomeView from '@/views/HomeView.vue';
import { useProfilesStore } from '@/store/profiles';

// Create a mock for the ProfileCard component
vi.mock('@/components/ProfileCard.vue', () => ({
  default: {
    name: 'ProfileCard',
    props: {
      profile: Object
    },
    template: '<div class="mock-profile-card">{{ profile.name }}</div>'
  }
}));

describe('HomeView.vue', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia());
  });

  it('displays loading state correctly', async () => {
    // Get the store and set loading to true
    const store = useProfilesStore();
    store.loading = true;
    
    const wrapper = mount(HomeView);
    
    // Should show loading message
    expect(wrapper.find('.loading').exists()).toBe(true);
    expect(wrapper.find('.loading').text()).toContain('Loading profiles');
    
    // Should not display profile cards during loading
    expect(wrapper.find('.profiles-grid').exists()).toBe(false);
  });

  it('displays error state correctly', async () => {
    // Get the store and set an error
    const store = useProfilesStore();
    store.error = 'Failed to fetch data';
    
    const wrapper = mount(HomeView);
    
    // Should show error message
    expect(wrapper.find('.error').exists()).toBe(true);
    expect(wrapper.find('.error p').text()).toBe('Failed to fetch data');
  });

  it('renders profile cards when data is loaded', async () => {
    // Get the store and load sample data
    const store = useProfilesStore();
    store.loadSampleData();
    
    const wrapper = mount(HomeView);
    
    // Should render profile cards
    expect(wrapper.find('.profiles-grid').exists()).toBe(true);
    
    // Number of cards should match number of profiles
    const profileCards = wrapper.findAll('.mock-profile-card');
    expect(profileCards.length).toBe(store.profiles.length);
    
    // Test profiles with no ID but with a name
    store.profiles = [{name: 'Test Coffee', source: 'Test'}];
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.mock-profile-card').length).toBe(1);
  });

  it('filters profiles when source filter changes', async () => {
    // Get the store and load sample data
    const store = useProfilesStore();
    store.loadSampleData();
    
    const wrapper = mount(HomeView);
    
    // Initially all profiles should be shown
    expect(wrapper.findAll('.mock-profile-card').length).toBe(store.profiles.length);
    
    // Set source filter to Ethiopia
    await wrapper.find('select').setValue('Ethiopia');
    
    // Should call the store's setSource method
    expect(store.selectedSource).toBe('Ethiopia');
    
    // Number of displayed profiles should now equal the filtered count
    const filteredProfiles = store.profiles.filter(p => p.source === 'Ethiopia');
    expect(wrapper.findAll('.mock-profile-card').length).toBe(filteredProfiles.length);
  });

  it('shows empty state when no profiles match filter', async () => {
    // Get the store and load sample data
    const store = useProfilesStore();
    store.loadSampleData();
    
    // Set a source filter that won't match any profiles
    store.setSource('NonExistentSource');
    
    const wrapper = mount(HomeView);
    
    // Should show no profiles message
    expect(wrapper.find('.no-profiles').exists()).toBe(true);
    expect(wrapper.find('.no-profiles').text()).toContain('No coffee profiles found');
  });
});