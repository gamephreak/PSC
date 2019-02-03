import {ID} from './id';
import {Status} from './status';
// export type VolatileStatus = ID&{__isVolatile: true};

export interface Pokemon {
  status?: Status;
  volatiles: {[v: string]: 1};
}  // class
