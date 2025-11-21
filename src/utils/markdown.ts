import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

// Override the default link renderer to add target="_blank" to external links
const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');

  if (hrefIndex >= 0) {
    const href = token.attrs?.[hrefIndex][1];

    // Add target="_blank" and rel="noopener noreferrer" to external links
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      token.attrPush(['target', '_blank']);
      token.attrPush(['rel', 'noopener noreferrer']);
    }
  }

  return defaultRender(tokens, idx, options, env, self);
};

function render(text: string): string {
  return md.render(text);
}

export { render };
