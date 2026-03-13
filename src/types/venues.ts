import type { MarkdownText, EmptyString, Url } from './generic';

export interface EvanVenueRoom {
  readonly id: number;
  readonly name: string;
  readonly position: number;
  readonly venue?: number | null;
}

export interface EvanVenue {
  readonly is_main: boolean;
  readonly name: string;
  readonly city: string | EmptyString;
  readonly presentation: MarkdownText | EmptyString;
  readonly rooms: EvanVenueRoom[];
  readonly gmaps: Url | EmptyString;
  readonly google_place_id: string | EmptyString;
  readonly website: Url | EmptyString;
}
