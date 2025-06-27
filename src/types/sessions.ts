import type { ApiEndpoint, MarkdownText, EmptyString } from './generic';
import type { ImportantDate, Committee } from './extra_data';
import type { EvanSubsession } from './subsessions';
import type { EvanPaper } from './papers';
import type { EvanFile } from './files';

export interface EvanSession {
  readonly self: ApiEndpoint;
  readonly id: number;
  readonly slug: string;
  readonly code: string;
  readonly title: string;
  readonly description: MarkdownText | EmptyString;
  readonly program: MarkdownText | EmptyString;
  readonly is_social_event: boolean;
  readonly extra_attendees_fee: number;
  readonly start_at: string;
  readonly end_at: string;
  readonly track: number | null;
  readonly room: number | null;
  readonly topics: number[];
  readonly subsessions: EvanSubsession[];
  readonly papers: EvanPaper[];
  readonly files: EvanFile[];
  readonly extra_data: {
    committees: Committee[];
    important_dates: ImportantDate[];
  };
  // Additional computed property
  submission_deadline?: ImportantDate | null;
}
