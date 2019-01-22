import {ID} from './id';
import {Pokemon} from './pokemon';

// export type SideCondition = ID&{__isSideCondition: true};

export interface Side {  // class
  // NOTE: volatiles and status go on POKEMON, not side
  pokemon: Pokemon[];
  active?: number;  // index into pokemon, not set during team previow
  conditions?: {
    [sc: string]: {}
  };  // SideCondition[]; TODO needs to be a more complex object
}
