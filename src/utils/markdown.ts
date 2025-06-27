import { marked } from 'marked';

function render(text: string): string | Promise<string> {
  return marked.parse(text);
}

export { render };
