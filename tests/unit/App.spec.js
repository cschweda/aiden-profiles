import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { h } from 'vue';
import App from '@/App.vue';
import { useProfilesStore } from '@/store/profiles';

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterView: {
    name: 'RouterView',
    template: '<div class="router-view-mock">Router View Content</div>'
  },
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    // Add other router methods/properties as needed
  })),
  createWebHistory: vi.fn(),
}));

// Create a component stub for router-view
const RouterViewStub = {
  name: 'RouterView',
  render() {
    return h('div', { class: 'router-view-mock' }, 'Router View Content');
  }
};

describe('App.vue', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia());
    
    // Mock document.documentElement.setAttribute
    document.documentElement.setAttribute = vi.fn();
  });

  it('renders header, main content, and footer', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: RouterViewStub
        }
      }
    });
    
    expect(wrapper.find('header').exists()).toBe(true);
    expect(wrapper.find('main').exists()).toBe(true);
    expect(wrapper.find('footer').exists()).toBe(true);
    
    // Check logo and title
    expect(wrapper.find('.logo').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toContain('Aiden Coffee Profiles');
    
    // Check footer text
    expect(wrapper.find('footer').text()).toContain('Made for the Aiden Brewer');
  });

  it('applies theme class correctly', async () => {
    // Create a new store and set theme to dark
    const store = useProfilesStore();
    store.theme = 'dark';
    
    // Mount component
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: RouterViewStub
        }
      }
    });
    
    // Get the app div
    const appDiv = wrapper.find('#app');
    expect(appDiv.exists()).toBe(true);
    
    // Verify class is applied based on theme
    expect(appDiv.attributes('class')).toContain('dark-theme');
    
    // Change theme to light
    store.theme = 'light';
    await wrapper.vm.$nextTick();
    
    // Verify class updates
    expect(appDiv.attributes('class')).toContain('light-theme');
    expect(appDiv.attributes('class')).not.toContain('dark-theme');
  });

  it('calls fetchProfiles on mount', () => {
    const store = useProfilesStore();
    store.fetchProfiles = vi.fn();
    
    mount(App, {
      global: {
        stubs: {
          RouterView: RouterViewStub
        }
      }
    });
    
    expect(store.fetchProfiles).toHaveBeenCalledOnce();
  });

  it('refreshes data when refresh button is clicked', async () => {
    const store = useProfilesStore();
    store.fetchProfiles = vi.fn();
    
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: RouterViewStub
        }
      }
    });
    
    // Clear the initial call
    store.fetchProfiles.mockClear();
    
    // Click the refresh button
    await wrapper.find('.refresh-btn').trigger('click');
    
    expect(store.fetchProfiles).toHaveBeenCalledOnce();
  });

  it('toggles theme when theme button is clicked', async () => {
    const store = useProfilesStore();
    store.toggleTheme = vi.fn();
    
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: RouterViewStub
        }
      }
    });
    
    // Click the theme toggle button
    await wrapper.find('.theme-toggle').trigger('click');
    
    expect(store.toggleTheme).toHaveBeenCalledOnce();
  });

  it('shows loading state on refresh button', async () => {
    const store = useProfilesStore();
    store.loading = true;
    
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: RouterViewStub
        }
      }
    });
    
    // Check that button shows loading state
    expect(wrapper.find('.refresh-btn').classes()).toContain('loading');
    expect(wrapper.find('.refresh-btn .btn-text').text()).toBe('Refreshing...');
    
    // Change loading state to false
    store.loading = false;
    await wrapper.vm.$nextTick();
    
    // Button should return to normal state
    expect(wrapper.find('.refresh-btn').classes()).not.toContain('loading');
    expect(wrapper.find('.refresh-btn .btn-text').text()).toBe('Refresh Profiles');
  });
});