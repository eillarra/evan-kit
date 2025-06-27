import type { ApiEndpoint, MarkdownText, EmptyString } from './generic';
import type { EvanFile } from './files';

export interface EvanPaper {
  readonly self: ApiEndpoint;
  readonly id: number;
  readonly title: string;
  readonly abstract: MarkdownText | EmptyString;
  readonly doi: string;
  readonly session: number | null;
  readonly subsession: number | null;
  readonly topics: number[];
  readonly updated_at: string;
  readonly files: EvanFile[];
  readonly extra_data: {
    authors: {
      name: string;
      affiliation?: string;
    }[];
    authors_str?: string;
    internal_id?: number | string;
  };
}
