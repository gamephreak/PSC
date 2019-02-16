import {Format, ID} from '@pkmn.cc/data';

import {Field} from './field';
import {Side} from './side';

export interface Battle {
  readonly format: Format;

  readonly field: Field;
  readonly p1: Side;
  readonly p2: Side;

  // The current decision state of the Battle (see Side). NOTE: Unlike with
  // Side, this can never be 'wait' as one player will be in the 'switch' state.
  state: 'team'|'move'|'switch';

  // The current turn number.
  turn: number;

  // Seed for the PRNG (randomly chosen if unset).
  readonly prngSeed?: Readonly<[number, number, number, number]>;  // UNKNOWN

  // Incremented every successful switch (where the switched in Pokemon didn't
  // faint). Used for determing a Pokemon's abilityOrder.
  abilityOrder: number;

  // The last successful move that occurred on either side (Copycat).
  lastMove?: ID;

  // RBY: The last damage caused by a move (Counter).
  // PERCEIVE: range. Not observable if it causes the target to Faint, and not
  // fully inferrable because of random damage factor (and Psywave).
  lastDamage?: number;

  // TODO Endless Battle Clause
  // staleWarned?: boolean;
}
