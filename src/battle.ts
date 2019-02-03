import {Format} from 'pkmn'

import {Field} from './field';
import {Side} from './side';

export type GameType = 'Singles'|'Doubles'|'Triples'|'Rotation';

export interface Battle {
  format: Format;
  gameType: GameType;

  field: Field;
  p1: Side;
  p2: Side;
}
