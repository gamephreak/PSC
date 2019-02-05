import {BoostsTable, ID, PokemonSet, StatsTable, Status, Type} from 'pkmn';

import {PersistentEffect} from './effect';

export type VolatileStatus = ID&{__isVolatile: true};

// TODO
export interface VolatileStatusData extends PersistentEffect<VolatileStatus> {
  damage?: number;  // Counter / Mirror Coat / Metal Burst, partialtrappinglock
  hp?: number;      //  Substitute
  multiplier?: number;    // Fury Cutter / Helping Hand / Autotomize
  hitCount?: number;      // Ice Ball / Rollout
  position?: number;      // Mirror Coat
  gotHit?: boolean;       // Shell Trap
  layers?: number;        // Stockpile
  time?: number;          // Confusion
  counter?: number;       // residualdmg (RBY Toxic)
  locked?: Pokemon;       // partialtrappinglock (RBY Wrap)
  trueDuration?: number;  // Outrage / Thrash / Petal Dance
  lostFocus?: boolean;    // Focus Punch
}

export interface StatusData {
  type: Status;
  // Tracks the duration/severity of the status. For Sleep this counts down
  // until the Pokemon is awake, and for Toxic this increased from 0 to 15 while
  // the Pokemon is left in.
  counter?: number;
  // The total duration the Sleep status will last (counter is reset to this
  // on switch-in in BW).
  duration?: number;
}

export interface MoveSlot {
  move: ID;
  // The current remaining PP of this Slot.
  pp: number;
  // The maximum possible PP for this Slot.
  maxpp: number;
  // Whether or not this move has been used since the Pokemon has been active
  // (Last Resort).
  used?: boolean;
  // Whether this moveSlot is virtual (Transform).
  virtual?: boolean;
  // Whether or not this move has been disabled. This may be 'hidden' if the
  // Pokemon is maybeDisabled but hasn't tried the move yet (Imprison).
  disabled: boolean|'hidden';
}

// The result of a move used by this Pokemon:
//   - 'skipped': the move was skipped (eg. recharge, trapped by Sky Drop)
//   - 'failure': the move completely failed (eg. missed, immunity, immobilized)
//   - 'success': the move successful exected one or more of its effects on one
//                or more targets or was blocked (eg. Protect).
export type MoveResult = 'skipped'|'failure'|'success';

export interface Pokemon {
  readonly set: PokemonSet;

  // The Pokemon's current HP (as opposed to maxHP which can be calculated).
  hp: number;

  status?: Status;
  volatiles?: {[id: string]: VolatileStatusData};

  // The ID of the species *name* (ie. including cosmeticForme) this Pokemon
  // currently represents.
  species: ID;
  // The Pokemon's current weight in kg. Originally set based on the species
  // base weight, but can vary over the battle. (Float Stone / Autotomize).
  weight: number;
  // The Pokemon's types. NOTE: type1 can sometimes be '???'.
  type1: Type;
  type2?: Type;
  // The ID of this Pokemon's current item, if any (can be taken/used/etc).
  item?: ID;
  // The ID of this Pokemon's current ability.
  ability?: ID;
  // The Type and Base Power of Hidden Power for this Pokemon after it has
  // transformed. Before BW, Pokemon copy the Hidden Power data (as well as IVs)
  // of whatever they change into.
  hpType?: Type;
  hpPower?: number;

  // All boosts that this Pokemon has accumulated.
  boosts: BoostsTable;
  // The unboosted and unmodified stats of this Pokemon, calculated from the
  // base stats of the species (which may change) and the set, or copied during
  // transformation.
  stats: StatsTable;
  // RBY: The modified stats of this Pokemon. (Stat Modification Glitch)
  modifiedStats?: StatsTable;

  // The original/base attributes that this Pokemon started the battle with.
  original: {ability: ID, stats: StatsTable, moveSlots: MoveSlot[]};

  moveSlots: MoveSlot[];

  // Whether or not this Pokemon may be trapped (Arena Trap / Magnet Pull);
  maybeTrapped?: boolean;
  // Whether or not this Pokemon is trapped (unable to switch). This may be
  // 'hidden' if Pokemon is maybeTrapped but has not attempted to switch.
  trapped: boolean|'hidden';

  // If this Pokemon is active, the number of turns it has been active for.
  activeTurns?: number;
  // Set from Battle abilityOrder, used to determine redirects.
  abilityOrder: number;

  // The ID of this Pokemon this Pokemon may mega-evolve into. Unset if the
  // Pokemon cannot mega evolve (or wrong itemmove/an ally has mega-evolved).
  megaEvo?: ID;
  // The ID of this Pokemon this Pokemon may Ultra Burst into. Unset if the
  // Pokemon cannot mega Ultra Burst (or wrong item).
  ultraBurst?: ID;

  // The ally Pokemon this Pokemon is pretending to be (Zorua / Zoroak).
  illusion?: Pokemon;
  // Whether or not this Pokemon has transformed (Ditto / Smeargle / Mew).
  transformed?: boolean;
  // Whether's this Pokemon's Disguise has been broken (Mimikyu).
  busted?: boolean;
  // Whether or not this Pokemon may have disabled moves (Imprison).
  maybeDisabled: boolean;
  // The results of the moves used by this Pokemon last turn and this turn.
  // moveResult will be undefined if this Pokemon has not moved yet
  // (Stomping Tantrum / Truant).
  moveResult?: {lastTurn?: MoveResult, thisTurn?: MoveResult};
  // The turn number this Pokemon was dragged in (RBY / GSC).
  draggedIn?: number;
  // Whether this Pokemon has used an item this turn (Pickup).
  usedItemThisTurn?: boolean;
  // The lastItem this Pokemon held, provided it used the item up in some way
  // (Harvest / Pickup / Recycle).
  lastItem?: ID;
  // Whether this Pokemon has eaten a berry (Belch).
  ateBerry?: boolean;
  // Whether or not to show Natural Cure's effect (Doubles/Triples).
  showCure?: boolean;
  // Whether this Pokemon has been damaged this turn (Assurance).
  hurtThisTurn: boolean;
}
