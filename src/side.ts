import {ID, Move} from 'pkmn';
import {Pokemon} from './pokemon';
import {PersistentEffect} from './effect';

export type SideCondition = ID&{__isSideCondition: true};

export interface Side { 
  state: 'preview' | 'move' | 'switch' | 'wait';
  pokemon: Pokemon[];
  active: number;
  conditions?: { [id: string]: PersistentEffect<SideCondition> }
  fainted: {lastTurn: boolean, thisTurn: boolean};
  lastMove?: ID;
  zMoveUsed?: boolean;
}
