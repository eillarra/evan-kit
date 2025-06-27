// Essential types for evan-kit
// Note: These are basic types. The consuming application should provide
// more detailed types based on their specific Evan API version

export interface EvanEvent {
  readonly code: string;
  readonly name: string;
  readonly full_name: string;
  readonly email: string;
  readonly city: string;
  readonly start_date: string;
  readonly end_date: string;
  readonly tracks?: EvanTrack[];
  readonly venues?: EvanVenue[];
  readonly extra_data?: Record<string, unknown>;
}

export interface EvanTrack {
  readonly id: number;
  readonly name: string;
  readonly position: number;
}

export interface EvanVenue {
  readonly id: number;
  readonly name: string;
  readonly is_main: boolean;
  readonly rooms?: EvanRoom[];
}

export interface EvanRoom {
  readonly id: number;
  readonly name: string;
  readonly capacity?: number;
}

export interface EvanContent {
  readonly key: string;
  readonly content: string;
  readonly content_type: string;
}

export interface EvanSession {
  readonly id: number;
  readonly title: string;
  readonly start_time: string;
  readonly end_time: string;
  readonly self: string;
  readonly track?: EvanTrack;
  readonly room?: EvanRoom;
  readonly extra_data?: Record<string, unknown>;
}

export interface EvanPaper {
  readonly id: number;
  readonly title: string;
  readonly abstract?: string;
  readonly extra_data?: {
    authors?: Array<{ name: string }>;
    authors_str?: string;
    internal_id?: string | number;
  };
}

export interface EvanKeynote {
  readonly id: number;
  readonly title: string;
  readonly speaker: string;
  readonly start_time: string;
  readonly end_time: string;
}
