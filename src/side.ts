import {ID, Move} from '@pkmn.cc/data';

import {PersistentEffect} from './effect';
import {Pokemon} from './pokemon';

export type SideCondition = ID&{__isSideCondition: true};

export interface SideConditionData extends PersistentEffect<SideCondition> {
  // Sources of the side condition, in the case of multiple (Pursuit).
  sources?: Pokemon[];  // TODO is this necessary?
  // Positions affected by a future move (Doom Desire / Future Sight / Wish).
  positions?: {
    [position: number]: {
      duration: number;
      source?: Pokemon;
      move?: ID;
      hp?: number;  // PERCEIVE: 1/2 of inferred source's HP stat.
    }
  };
  // The number of layers (Spikes / Toxic Spikes). Also used to denote the
  // number of wishes (Wish).
  layers?: number;
}

export interface Side {
  // The current decision state of the Side:
  //   - 'team': beginning of BW/XY/SM battle (Team Preview)
  //   - 'move': beginning of each turn
  //   - 'switch': end of turn if fainted (or mid turn with switching effects)
  //   - 'wait': wait for the other player's 'switch' decision
  //   - 'done': the battle is over.
  state: 'team'|'move'|'switch'|'wait'|'done';
  // The team of Pokemon the player for this Side brought to battle (1 - 6).
  readonly pokemon: Pokemon[];  // OBSERVE: not all known before switch/team.
  // The index into pokemon of the active Pokemon (undefined for Team Preview),
  // can be of length 1-3 depending on the Battle's gameType.
  active?: [number];
  // The conditions active on this Side.
  conditions?: {[id: string]: SideConditionData};

  // Whether any Pokemon were fainted last turn (Retaliate) or this
  // turn (RBY/GSC).
  fainted: {lastTurn: boolean, thisTurn: boolean};
  // The last move used by a Pokemon from this Side (RBY Counter).
  lastMove?: ID;
  // Whether this side has used a Z-Move (SM+).
  zMoveUsed?: boolean;
}
