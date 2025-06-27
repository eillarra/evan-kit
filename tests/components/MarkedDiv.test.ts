import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import MarkedDiv from '@evan/components/MarkedDiv.vue';

describe('MarkedDiv Component', () => {
  it('should render markdown content correctly', () => {
    const wrapper = mount(MarkedDiv, {
      props: {
        text: '**Bold text**',
      },
    });

    expect(wrapper.html()).toContain('<strong>Bold text</strong>');
    expect(wrapper.classes()).toContain('evan__marked');
  });

  it('should handle null value gracefully', () => {
    const wrapper = mount(MarkedDiv, {
      props: {
        text: null,
      },
    });

    expect(wrapper.html()).toBe('<!--v-if-->');
  });

  it('should handle undefined value gracefully', () => {
    const wrapper = mount(MarkedDiv, {
      props: {
        text: undefined,
      },
    });

    expect(wrapper.html()).toBe('<!--v-if-->');
  });

  it('should handle empty string gracefully', () => {
    const wrapper = mount(MarkedDiv, {
      props: {
        text: '',
      },
    });

    expect(wrapper.html()).toBe('<!--v-if-->');
  });

  it('should handle whitespace-only string gracefully', () => {
    const wrapper = mount(MarkedDiv, {
      props: {
        text: '   \n\t  ',
      },
    });

    expect(wrapper.html()).toBe('<!--v-if-->');
  });

  it('should render content with whitespace but actual text', () => {
    const wrapper = mount(MarkedDiv, {
      props: {
        text: '  Hello world  ',
      },
    });

    expect(wrapper.html()).toContain('Hello world');
    expect(wrapper.classes()).toContain('evan__marked');
  });

  it('should render complex markdown correctly', () => {
    const wrapper = mount(MarkedDiv, {
      props: {
        text: '# Title\n\n- Item 1\n- Item 2\n\n**Bold** and *italic*',
      },
    });

    const html = wrapper.html();
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<li>Item 1</li>');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });
});
