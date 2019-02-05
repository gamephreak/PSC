import {ID, Move} from 'pkmn';

import {PersistentEffect} from './effect';
import {Pokemon} from './pokemon';

export type SideCondition = ID&{__isSideCondition: true};

export interface SideConditionData extends PersistentEffect<SideCondition> {
  // Sources of the side condition, in the case of multiple (Pursuit).
  sources?: Pokemon[];  // TODO is this necessary?
  // Positions affected by a future move (Doom Desire / Future Sight).
  positions?:
      {[position: number]: {duration: number; source: Pokemon, move: ID;}};
  // The number of layers (Spikes / Toxic Spikes).
  layers?: number;
}

export interface Side {
  // The current decision state of the Side:
  //   - 'preview': beginning of BW/XY/SM battle (Team Preview)
  //   - 'move': beginning of each turn
  //   - 'switch': end of turn if fainted (or mid turn with switching effects)
  //   - 'wait': wait for the other player's 'switch' decision
  state: 'preview'|'move'|'switch'|'wait';
  // The team of Pokemon the player for this Side brought to battle (1 - 6).
  readonly pokemon: Readonly<Pokemon[]>;
  // The index into pokemon of the active Pokemon (undefined for Team Preview).
  active?: number;
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
