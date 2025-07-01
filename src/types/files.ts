import type { Url } from './generic';

export interface EvanFile {
  readonly id: number;
  readonly name: string;
  readonly file: Url;
  readonly size: number;
  readonly tags: string[];
}
