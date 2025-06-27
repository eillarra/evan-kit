// Generic types used throughout the Evan API
export type ApiEndpoint = string;
export type Url = string;
export type MarkdownText = string;
export type EmptyString = '';

export interface EvanCountry {
  readonly code: string;
  readonly name: string;
}
