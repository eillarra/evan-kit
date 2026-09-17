import MarkdownIt from 'markdown-it';
import attrs from 'markdown-it-attrs';
import sanitizeHtml from 'sanitize-html';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs';

// html: true is required so generated HTML markers like <paper-ref ...>
// survive rendering and can be enhanced by ProgramMarkedDiv. Content comes from
// the trusted conference CMS, but raw HTML is still sanitized on output so
// script/iframe/event-handler injection cannot pass through.
const md = new MarkdownIt({ html: true });

md.use(attrs, {
  allowedAttributes: ['class', 'style'],
  leftDelimiter: '{',
  rightDelimiter: '}',
});

// Override the default link renderer to add target="_blank" to external links
const defaultRender: RenderRule =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
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
  return sanitizeHtml(md.render(text), {
    // Escape disallowed tags instead of discarding them so CMS typos stay visible
    disallowedTagsMode: 'escape',
    // Defaults are text-only; allow the inline/media tags CMS content relies on
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'a',
      'b',
      'i',
      'em',
      'strong',
      'br',
      'code',
      'img',
      'paper-ref',
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
      // paper-ref markers carry data-paper-id / data-paper-title attributes
      '*': ['class', 'style', 'data-*'],
    },
  });
}

export { render };
