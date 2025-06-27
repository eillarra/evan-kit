import { describe, it, expect } from 'vitest';

import { render } from '@evan/utils/markdown';

describe('markdown render', () => {
  it('should render basic markdown', () => {
    const result = render('# Hello World');
    expect(result).toContain('<h1');
    expect(result).toContain('Hello World');
  });

  it('should render links correctly', () => {
    const result = render('[Link text](https://example.com)');
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('Link text');
  });

  it('should render bold and italic text', () => {
    const result = render('**bold** and *italic*');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('should handle empty input', () => {
    const result = render('');
    expect(result).toBe('');
  });

  it('should handle plain text', () => {
    const result = render('Just plain text');
    expect(result).toContain('Just plain text');
  });

  it('should render lists', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const result = render(markdown);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Item 1</li>');
    expect(result).toContain('<li>Item 2</li>');
  });

  it('should render code blocks', () => {
    const result = render('`inline code`');
    expect(result).toContain('<code>inline code</code>');
  });

  it('should handle paragraphs', () => {
    const markdown = 'First paragraph\n\nSecond paragraph';
    const result = render(markdown);
    expect(result).toContain('<p>First paragraph</p>');
    expect(result).toContain('<p>Second paragraph</p>');
  });
});
