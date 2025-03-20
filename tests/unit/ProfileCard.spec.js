import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfileCard from '@/components/ProfileCard.vue';

describe('ProfileCard.vue', () => {
  it('renders a coffee profile correctly', () => {
    const profile = {
      name: 'Ethiopia Yirgacheffe',
      source: 'Ethiopia',
      roast: 'Light',
      process: 'Washed',
      notes: 'Floral, Citrus, Bergamot',
      description: 'Bright and complex coffee with floral notes',
      temperature: '92°C',
      grind_size: 'Medium-Fine',
      brew_ratio: '1:16',
      brew_time: '3:30'
    };

    const wrapper = mount(ProfileCard, {
      props: {
        profile: profile
      }
    });

    // Check if the profile name is rendered correctly
    expect(wrapper.find('.profile-title').text()).toBe('Ethiopia Yirgacheffe');
    
    // Check if source is rendered correctly
    expect(wrapper.find('.profile-source').text()).toBe('Ethiopia');
    
    // Check if the roast badge is present and has correct content
    expect(wrapper.find('.profile-badge').text()).toBe('Light');
    
    // Check if the roast class is applied correctly
    expect(wrapper.find('.profile-header').classes()).toContain('roast-light');
    
    // Check if flavor notes are rendered correctly
    const noteTags = wrapper.findAll('.note-tag');
    expect(noteTags.length).toBe(3);
    expect(noteTags[0].text()).toBe('Floral');
    expect(noteTags[1].text()).toBe('Citrus');
    expect(noteTags[2].text()).toBe('Bergamot');
    
    // Check if brewing parameters are displayed correctly
    expect(wrapper.find('.brewing-params').exists()).toBe(true);
    const brewingParams = wrapper.findAll('.param-value');
    expect(brewingParams.length).toBe(4);
  });

  it('handles missing data gracefully', () => {
    const profile = {
      name: 'Minimal Coffee',
      // Missing many fields
    };

    const wrapper = mount(ProfileCard, {
      props: {
        profile: profile
      }
    });

    // Check if the profile name is rendered correctly
    expect(wrapper.find('.profile-title').text()).toBe('Minimal Coffee');
    
    // Check that source shows "Unknown Source" when missing
    expect(wrapper.find('.profile-source').text()).toBe('Unknown Source');
    
    // Brewing params section shouldn't be rendered
    expect(wrapper.find('.brewing-params').exists()).toBe(false);
  });
  
  it('handles different roast types', () => {
    // Test light roast
    const lightRoast = mount(ProfileCard, {
      props: {
        profile: { name: 'Light Roast', roast: 'Light' }
      }
    });
    expect(lightRoast.find('.profile-header').classes()).toContain('roast-light');
    
    // Test medium roast
    const mediumRoast = mount(ProfileCard, {
      props: {
        profile: { name: 'Medium Roast', roast: 'Medium' }
      }
    });
    expect(mediumRoast.find('.profile-header').classes()).toContain('roast-medium');
    
    // Test dark roast
    const darkRoast = mount(ProfileCard, {
      props: {
        profile: { name: 'Dark Roast', roast: 'Dark' }
      }
    });
    expect(darkRoast.find('.profile-header').classes()).toContain('roast-dark');
    
    // Test unknown roast
    const unknownRoast = mount(ProfileCard, {
      props: {
        profile: { name: 'Unknown Roast', roast: 'Special' }
      }
    });
    expect(unknownRoast.find('.profile-header').classes()).not.toContain('roast-light');
    expect(unknownRoast.find('.profile-header').classes()).not.toContain('roast-medium');
    expect(unknownRoast.find('.profile-header').classes()).not.toContain('roast-dark');
  });
  
  it('handles different brewing parameter combinations', () => {
    // Profile with all brewing parameters
    const fullParams = mount(ProfileCard, {
      props: {
        profile: { 
          name: 'Full Params',
          temperature: '93°C',
          brew_ratio: '1:16',
          grind_size: 'Medium',
          brew_time: '3:30'
        }
      }
    });
    expect(fullParams.find('.brewing-params').exists()).toBe(true);
    expect(fullParams.findAll('.brewing-param').length).toBe(4);
    
    // Profile with only ratio as "ratio" instead of "brew_ratio"
    const ratioOnly = mount(ProfileCard, {
      props: {
        profile: { 
          name: 'Ratio Only',
          ratio: '1:15'
        }
      }
    });
    expect(ratioOnly.find('.brewing-params').exists()).toBe(true);
    expect(ratioOnly.findAll('.brewing-param').length).toBe(1);
    expect(ratioOnly.find('.param-value').text()).toBe('1:15');
    
    // Profile with only temperature
    const tempOnly = mount(ProfileCard, {
      props: {
        profile: { 
          name: 'Temp Only',
          temperature: '94°C'
        }
      }
    });
    expect(tempOnly.find('.brewing-params').exists()).toBe(true);
    expect(tempOnly.findAll('.brewing-param').length).toBe(1);
  });
});