import {ID, Status} from 'pkmn';

export type VolatileStatus = ID&{__isVolatile: true};

export interface Pokemon {
  status?: Status;
  volatiles: Set<VolatileStatus>;
}
