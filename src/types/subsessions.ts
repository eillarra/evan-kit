import type { ApiEndpoint, MarkdownText, EmptyString } from './generic';
import type { EvanPaper } from './papers';

export interface EvanSubsession {
  readonly self: ApiEndpoint;
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly description: MarkdownText | EmptyString;
  readonly program: MarkdownText | EmptyString;
  readonly start_at: string;
  readonly end_at: string;
  readonly papers: EvanPaper[];
}
