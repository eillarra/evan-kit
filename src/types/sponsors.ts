import type { Url } from './generic';
import type { EvanFile } from './files';

export interface EvanSponsor {
  readonly id: number;
  readonly name: string;
  readonly website: Url;
  readonly level: number;
  readonly files: EvanFile[];
}
