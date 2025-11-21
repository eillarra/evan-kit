import type { ApiEndpoint, MarkdownText, EmptyString } from './generic';
import type { EvanFile } from './files';

export interface EvanKeynote {
  readonly self: ApiEndpoint;
  readonly id: number;
  readonly code: string;
  readonly title: string;
  readonly speaker: string;
  readonly bio: MarkdownText | EmptyString;
  readonly abstract: MarkdownText | EmptyString;
  readonly session: number | null;
  readonly subsession: number | null;
  readonly updated_at: string;
  readonly files: EvanFile[];
  readonly extra_data: {
    speaker_affiliation?: string;
    speaker_website?: string;
    presentation_url?: string;
  };
}
