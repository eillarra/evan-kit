import type { MarkdownText, EmptyString, Url, EvanCountry } from './generic';
import type { ImportantDate } from './extra_data';
import type { EvanSession } from './sessions';
import type { EvanTrack } from './tracks';
import type { EvanTopic } from './topics';
import type { EvanVenue } from './venues';

export interface EvanFee {
  readonly type: string;
  readonly notes: string;
  readonly early_value: number;
  readonly value: number;
  readonly config: {
    included_social_events: number[];
  };
}

export interface EvanEvent {
  readonly code: string;
  readonly name: string;
  readonly full_name: string;
  readonly presentation: MarkdownText | EmptyString;
  readonly hashtag: string | EmptyString;
  readonly email: string | EmptyString;
  readonly city: string;
  readonly country: EvanCountry;
  readonly start_date: string;
  readonly end_date: string;
  readonly is_open_for_registration: boolean;
  readonly registration_start_date: string;
  readonly registration_early_deadline: string;
  readonly registration_deadline: string;
  readonly registration_url: Url;
  readonly fees: EvanFee[];
  readonly sessions: EvanSession[];
  readonly tracks: EvanTrack[];
  readonly topics: EvanTopic[];
  readonly venues: EvanVenue[];
  readonly extra_data: {
    important_dates: ImportantDate[];
  };
}
