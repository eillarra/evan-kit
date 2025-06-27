import type { ApiEndpoint, MarkdownText, EmptyString } from './generic';

export interface EvanKeynote {
  readonly self: ApiEndpoint;
  readonly id: number;
  readonly code: string;
  readonly title: string;
  readonly speaker: string;
  readonly abstract: MarkdownText | EmptyString;
  readonly session: number | null;
  readonly subsession: number | null;
  readonly updated_at: string;
  readonly extra_data: {
    speaker_bio?: string;
    speaker_affiliation?: string;
    speaker_website?: string;
    speaker_photo?: string;
    [key: string]: unknown;
  };
}
