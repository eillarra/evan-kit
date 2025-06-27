export interface ImportantDate {
  readonly label: string;
  readonly format: 'date' | 'range' | 'month';
  readonly start_date: string;
  readonly end_date: string | null;
  readonly aoe: boolean;
  readonly formatted?: string;
  readonly is_past?: boolean;
}

export interface Person {
  readonly first_name: string;
  readonly last_name: string;
  readonly affiliation: string | null;
  readonly email: string | null;
}

export interface Committee {
  readonly name: string;
  readonly members: Person[];
  readonly display: 'full' | 'list';
  readonly sorting: 'first_name' | 'last_name';
}
