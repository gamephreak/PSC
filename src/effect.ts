import {Format, ID} from 'pkmn';

import {Pokemon} from './pokemon';

export interface PersistentEffect<T> {
  type: T;
  id: ID;
  duration?: number;
  source?: Pokemon;
  sourcePosition?: number;
}
