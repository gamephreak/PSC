import {PokemonSet, Status, Gender} from 'pkmn';

type MoveResult =  'Skipped'|'Failure'|'Success';

export interface VolatileStatusData extends PersistentEffect<VolatileStatus> {
  damage?: number; // Counter / Mirror Coat / Metal Burst, partialtrappinglock
  hp?: number; //  Substitute
  multiplier?: number; // Fury Cutter / Helping Hand / Autotomize
  hitCount?: number; // Ice Ball / Rollout
  position?: number; // Mirror Coat
  gotHit?: boolean; // Shell Trap
  layers?: number; // Stockpile
  time?: number; // Confusion
  counter?: number; // residualdmg (RBY Toxic)
  locked?: Pokemon; // partialtrappinglock (RBY Wrap)
  trueDuration?: number; // Outrage / Thrash / Petal Dance
  lostFocus?: boolean; // Focus Punch

  //* ??? ***********************

  //*  Mystery Berry as Leppa Berry, not needed between decisions
  moveSlot?: MoveSlot;
}

interface StatusData {
  type: Status;
  counter?: number;

  //* REMOVED ***********************
  time?: number; // Sleep TODO
  startTime?: number; // Sleep TODO
  stage?: number; // Toxic
}

interface Pokemon {
  set: PokemonSet;
  details: string;
  status?: StatusData;
  volatiles: {[id: string}: VolatileStatusData}; // TODO
  hp: number;

  // Usually from set/Species but can change over the battle.
  species: ID; // = species *name* id
  weight: number;
  type1: Type;
  type2?: Type;
  item?: ID;
  ability?: ID;
  hpType: Type;
  hpType: number;

  stats: StatsTable;
  modifiedStats: StatsTable; // Gen1 only
  boosts: BoostsTable;
  moveSlots: MoveSlot[];

  trapped?: boolean|'hidden';
  maybeTrapped?: boolean;

  activeTurns?: number;
  abilityOrder?: number;

  canMegaEvo?: ID;
  canUltraBurst?: ID;
  // Zorua / Zoroak
  illusion?: Pokemon;
  // Ditto / Smeargle / Mew
  transformed: boolean;
  // Mimikyu
  busted?: boolean;
// Imprison
  maybeDisabled: boolean;
  // Stomping Tantrum / Truant
  moveResult?: {lastTurn?: MoveResult, thisTurn?: MoveResult};
  // RBY/GSC Statuses
  draggedIn?: number; // Turn number
  // Harvest / Pickup / Recycle
  lastItem?: ID;
  // Belch
  ateBerry?: boolean;
  // Pickup (Doubles/Triples)
  usedItemThisTurn?: boolean;
  // Assurance
  hurtThisTurn: boolean;
  // RBY Selfdestruct Glitch
  subFainted?: boolean;
  // Payback / Core Enforcer / Helping Hand
  newlySwitched: boolean;
  // Fusion Flare / Fusion Bolt / RBY Mirror Move
  moveThisTurn?: ID;
  // Shell Bell / RBY Partial Trapping
  lastDamage: number;
  // Forest's Curse / Trick-or-Treat
  addedType?: Type;
  // Revenge / Avalanche
  attackedBy: {source: Pokemon, damage: number, thisTurn: boolean, move?: ID}[];



  //* WIP ***********************
  knownType?: boolean; // TODO
  apparentType?: string; // TODO Type1(/Type2)

  switchFlag: boolean|string;
  switchCopyFlag: boolean; // |string?
  forceSwitchFlag: boolean; // |string? // Eject Button/Red Card

  // Pursuit
  beingCalledBack: boolean;
  // Internal? Used by Trace
  isStarted: boolean;

  // Endless Battle
  isStale: number;
  isStaleSourc: string;
  isStaleCon: number;
  isStaleHP: number;
  isStalePPTurns: number;
  staleWarned: boolean;


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
  baseTemplate: Template;
  template: Template;
  //* not relevant?
  heightm: number;
  //* Can calculate
  hpPower: number;
  //* always 'a' because singles
  position: number;
  //* can calculate from base stats
  maxhp: number;
  //* unnecessary? hp == 0;
  fainted: boolean;
  //* No faint queuing (between turns)
  faintQueued: boolean;
  // Can't change.
  baseIvs: number;
  baseHpType: Type;
  //* Can calculate from IVs
  baseHpPower: number;
  //* Unused (always false)
  duringMove: boolean;
  //* Already tracked in Side
  isActive: boolean;
  //* Can caclulate from boosted + modified speed and trickroom
  speed: number;
  //* From set
  level: number;
  gender: Gender;
  happiness: number;

  //* TODO Seperate fields
  statusData: AnyObject;
  abilityData: {[k: string]: string | Pokemon};
  itemData: {[k: string]: string | Pokemon};
  speciesData: AnyObject;
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
  disabled: boolean|'hidden'; // we can't tell if disabled 'hidden', need to rely on maybeDisabled.

  //* REMOVED ***********************
  //* Move name
  move: string;
  //* Just move.Target
  target?: string;
  //* only set if choicelocked
  disabledSource?: string;
}

// TODO
export interface EffectData {
  activated: boolean;
  busted: boolean;
  counter: number;
  forme: ??;
  gaveUp: boolean;
  hitCount: number;
  lastDamage: number;
  lastDamageSource: Pokemon;
  lastMove: ID;
  layers: number;
  move: ID;
  mulitipler: number;
  numConsecutive: number;
  position: ??;
  positions: ??[];
  positions: boolean[];
  prankserBoosted = ??;
  source: Pokemon;
  sourceEffect: ???;
  sources: Pokemon[];
  stage: number;
  startTime: number;
  target: Pokemon;
  time: number;
  totalDamage: number;
  trueDuration: number;
  wishes: number;
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
