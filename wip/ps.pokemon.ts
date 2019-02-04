import {PokemonSet, Status, Gender} from 'pkmn';

type MoveResult =  'Skipped'|'Failure'|'Success';

// TODO FUTURE SIGHT?
interface Pokemon {
  set: PokemonSet;
  moveResult = {lastTurn?: MoveResult, thisTurn?: MoveResult};
  status: Status;
  details: string;
  fainted: boolean;
  transformed: boolean;
  volatiles: {[id: string}: VolatileStatus}; // TODO

  // Not just inferred from set/species because can change!
  hp: number;
  name: string;
  species: ID; // = species *name* id
  item: ID;
  ability: ID;
  level: number;
  gender: Gender;
  happiness: number;
  pokeball: string;
  hpType: Type;
  stats: StatsTable;
  boosts: BoostsTable;
  moveSlots: MoveSlot[];
  weight: number;

  original: { moveSlots: MoveSlot[] };
  
  //* WIP ***********************

  // TODO can we replace by mapping over moveslots and looking for 'hidden'?
  maybeDisabled: boolean; // Imprison was used

   original: {
    // TODO is everything below not just obtainable from set?
    ability: ID;
    // Transform copies IVs in gen 4 and earlier, so we track the base IVs/HP-type/power
    stats: StatsTable; 
    ivs: StatsTable;
    //* Can calculate.
    //hpType: Type;
    //hpPower: number;
  };

  //* ??? ***********************
 
  modifiedStats: StatsTable; // Gen1 only

  lastItem: string; // ID
  lastMove?: Move;
  lastDamage: number;
 
  moveThisTurn: string|boolean;
  hurtThisTurn: boolean;
  usedItemThisTurn: boolean;

  trapped: boolean | 'hidden';
  // TODO is this not just trapped == 'hidden'?
  maybeTrapped: boolean;
  illusion?: Pokemon;

  faintQueued: boolean;

  ateBerry: boolean;

  switchFlag: boolean|string;
  forceSwitchFlag: boolean; // |string?
  switchCopyFlag: boolean; // |string?
  draggedIn?: number;
  newlySwitched: boolean;
  beingCalledBack: boolean;

  attackedBy: {source: Pokemon, damage: number, thisTurn: boolean, move?: string}[];
  isActive: boolean;
  activeTurns: number;
  isStarted: boolean; // Have this pokemon's Start events run yet?
  duringMove: boolean;
 
  apparentType: string; // Type1(/Type2)
  types: Type[]; // type1, type2
  addedType: Type;
  knownType: boolean;

  canMegaEvo = string | null | undefined;
  canUltraBurst = string | null | undefined;

  subFainted?: boolean;

  isStale: number;
  isStaleCon: number;
  isStaleHP: number;
  isStalePPTurns: number;
  staleWarned: boolean;
 
  statusData: AnyObject;
  abilityData: {[k: string]: string | Pokemon};
  itemData: {[k: string]: string | Pokemon};
  speciesData: AnyObject;

  showCure: boolean;
  speed: number;
  abilityOrder: number;
 
  // TODO forme change/transform?
  baseTemplate: Template; // Species
  template: Template; // Species

  //* REMOVED ***********************
  //* Backrefs
  side: Side;
  battle: Battle;
  //* Unused
  movepp: null; // ...
  //* Can construct from name
  fullName: string; // p1: name
  id: string; // === fullName
  //* = Species
  species: string; // TODO not template, but species name!
  speciesid: ID;
  //* not relevant?
  heightm: number;
  //* Can calculate
  hpPower: number;
  //* always 'a' because singles
  position: number;
  //* can calculate from base stats
  maxhp: number;
}

// TODO
interface VolatileStatus {
  id: ID;
  target: Pokemon;
  source?: Pokemon;
  sourePosition?: number;
  sourceEffect?: Effect;
  duration: number;
  linkedPokemon: Pokemon[];
  linkedStatus: status;
}

interface MoveSlot {
  id: ID;
  pp: number;
  maxpp: number;
  used?: boolean;
  virtual?: boolean; // If transformed


  //* ??? ***********************

  disabled: boolean | 'hidden';


  //* REMOVED ***********************
  //* Move name
  move: string;
  //* Just move.Target
  target?: string;
  //* only set if choicelocked
  disabledSource?: string;
}

/**
 * The result of the last move used on the previous turn by this
 * Pokemon. Stomping Tantrum checks this property for a value of false
 * when determine whether to double its power, but it has four
 * possible values:
 *
 * undefined indicates this Pokemon was not active last turn. It should
 * not be used to indicate that a move was attempted and failed, either
 * in a way that boosts Stomping Tantrum or not.
 *
 * null indicates that the Pokemon's move was skipped in such a way
 * that does not boost Stomping Tantrum, either from having to recharge
 * or spending a turn trapped by another Pokemon's Sky Drop.
 *
 * false indicates that the move completely failed to execute for any
 * reason not mentioned above, including missing, the target being
 * immune, the user being immobilized by an effect such as paralysis, etc.
 *
 * true indicates that the move successfully executed one or more of
 * its effects on one or more targets, including hitting with an attack
 * but dealing 0 damage to the target in cases such as Disguise, or that
 * the move was blocked by one or more moves such as Protect.
 */
moveLastTurnResult = boolean | null | undefined;

/**
 * The result of the most recent move used this turn by this Pokemon.
 * At the start of each turn, the value stored here is moved to its
 * counterpart, moveLastTurnResult, and this property is reinitialized
 * to undefined. This property can have one of four possible values:
 *
 * undefined indicates that this Pokemon has not yet finished an
 * attempt to use a move this turn. As this value is only overwritten
 * after a move finishes execution, it is not sufficient for an event
 * to examine only this property when checking if a Pokemon has not
 * moved yet this turn if the event could take place during that
 * Pokemon's move.
 *
 * null indicates that the Pokemon's move was skipped in such a way
 * that does not boost Stomping Tantrum, either from having to recharge
 * or spending a turn trapped by another Pokemon's Sky Drop.
 *
 * false indicates that the move completely failed to execute for any
 * reason not mentioned above, including missing, the target being
 * immune, the user being immobilized by an effect such as paralysis, etc.
 *
 * true indicates that the move successfully executed one or more of
 * its effects on one or more targets, including hitting with an attack
 * but dealing 0 damage to the target in cases such as Disguise. It can
 * also mean that the move was blocked by one or more moves such as
 * Protect. Uniquely, this value can also be true if this Pokemon mega
 * evolved or ultra bursted this turn, but in that case the value should
 * always be overwritten by a move action before the end of that turn.
 */
moveThisTurnResult = boolean | null | undefined;
