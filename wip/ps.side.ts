interface SideConditionData extends PersistentEffect<SideCondition> {
  layers?: number; // Spikes / Toxic Spikes
  sources: Pokemon[]; // pursuit
  positions?: {[position: number]: {
    duration: number;
    source: Pokemon,
    move: ID;
    moveData: any; // etc..

  }}; // futuremove (Future Sight/Doom Desire)
  sourceEffect: ActiveMove; // TODO
}

interface Side {
  // The 1-6 pokemon on the players team
  pokemon: Pokemon[];
  // The index into this.pokemon of the active pokemon, not set until past team preview
  active?: number;
  // The conditions active on the side, has duration (PersistentEffect)
  sideConditions: AnyObject;

  // Required for 'retaliate'
  faintedLastTurn: boolean;
  // Required for gen <= 2 turn ending
  faintedThisTurn: boolean;
  // Required for old gens (side's last move instead of pokemons last move for counter etc)
  lastMove?: Move;
  // Whether or not the side has used a zmove.
  zMoveUsed: boolean;
  // What state of request the current side is at
  currentRequest: 'move' | // begining of every turn
    'switch' | // end of turn with fainted or mid turn for u-turn, BP, etc
    'teampreview' | // begining of battle
    ''; // wait for other persons switch

  //* REMOVED ***********************

  //* Visual only
  avatar: string;
  //* Only support single battles, so active can be an index into Pokemon
  active: Pokemon[]; // [Pokemon] | [Pokemon, Pokemon] | [Pokemon, Pokemon, Pokemon]
  //* Battle has two sides, p1 and p2 already
  id: 'p1' | 'p2';
  //* Side number - 0|1 = redundant
  n: number;
  //* 'Player 1' or 'Player 2', useless
  name: string;
  //* Unnecessary, just opposite side in Battle
  foe: Side;
  //* Team is just pokemon.map(p => p.set);
  team: PokemonSet[];
  //* Unecessary, only 6
  maxTeamSize: number;
  //* Unnecessary backref
  battle: Battle;
  //* this.pokemon.map(p => p.fainted);
  pokemonLeft: number;
  //* Battle state is always captured at choice junctions
  choice: Choice;
}

interface ChosenAction {
  choice: 'move' | 'switch' | 'instaswitch' | 'team' | 'shift' | 'pass'; // action type
  index?: number; // the chosen index in Team Preview
  mega?: boolean; // true if megaing or ultra bursting
  moveid?: ID; // a move to use (move action only)
  pokemon?: Pokemon; // the pokemon doing the action
  priority?: number;
  side?: Side; // The action's side
  target?: Pokemon; // the target of the action
  targetLoc?: number; //relative location of the target to pokemon (move action only)
  zmove?: string; // if zmoving, the name of the zmove
}
// An object representing what the player has chosen to happen.
interface Choice {
  actions: ChosenAction[]; //  array of chosen actions
  cantUndo: boolean; // true if the choice can't be cancelled because of the maybeTrapped issue
  error: string; // contains error text in the case of a choice error
  forcedPassesLeft: number; // number of passes left that need to be performed
  forcedSwichesLeft: number; // number of switches left that need to be performed
  mega: boolean;// true if a mega evolution has already been selected
  switchIns: Set<number>; // indexes of pokemon chosen to switch in
  ultra: boolean; // true if an ultra burst has already been selected
  zMove: boolean; // true if a Z-move has already been selected
}
