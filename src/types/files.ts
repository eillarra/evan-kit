import type { Url } from './generic';

export interface EvanFile {
  readonly id: number;
  readonly name: string;
  readonly url: Url;
  readonly size: number;
}
