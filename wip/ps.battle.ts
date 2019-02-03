interface AnyObject {[k: string]: any}

type Effect = Ability | Item | ActiveMove | Template | PureEffect | Format

type FaintedPokemon {
  target: Pokemon;
  source?: Pokemon;
  effect?: Effect;
}

interface Battle {
  // Use pkmn.Format, then format.id
  formatid: ID;
  gameType: 'singles' | 'doubles' | 'triples' | 'rotation'
  p1: Side;
  p2: Side;

  // Optional?
  prngSeed: [number, number, number, number];
  // Not strictly necessary, but useful
  turn: number;
  // Need for baton pass/fainted/uturn etc
  midTurn: boolean;
  // Everything received so far
  log: string[];

  // EASY: to infer from logs, rename to just 'staleWarned' given we're not using staleWarned
  firstStaleWarned: boolean;
  // EASY: rename to 'state' and use similar enum as Side? -> can't really be in 'wait' state ever
  currentRequest: string; 
  
  // MEDIUM: Incremented after every switch activated on switch (no faint). Can we instead just leave at 0/1?
  abilityOrder: number;
  // ???: Required for Copycat. previous activeMove provided it didn't fail
  lastMove?: Move;
  // ???: Index into log of when last move occurred (need to calculate). Do we always know?
  lastMoveLine: number;

  // HARD: Required for gen1 Counter mechanics (maybe inaccurate because will get capped by total pokemons HP?)
  lastDamage: number;

  //* Field ***********************

  terrain: Terrain;
  terrainData: AnyObject;
  weather: Weather;
  weatherData: AnyObject;
  pseudoWeather: AnyObject;

  //* ??? ***********************
  
  // TODO I think none of these can happen because we can't be between events?, MUST CONFIRM
  effect: Effect;
  effectData: AnyObject;
  event: AnyObject; // {target?: Pokemon, source?: Pokemon, modifier?: number, ceilModifier?: number }
  events?: AnyObject;

  // TODO I don't think we need to care about faint queue because theres no choice/state position in between fainting? (only after!). CONFIRM
  faintQueue: FaintedPokemon[];
 
  // TODO I think we can have an active move (if state = switch, uturn/BP/healing wish etc is active?)
  activeMove?: ActiveMove;
  activePokemon?: Pokemon;
  activeTarget?: Pokemon;

  //* REMOVED ***********************

  //* Internal
  LEGACY_API_DO_NOT_USE: boolean;
  NOT_FAILURE: '';
  debugMode: boolean;
  comparePriority = (a:AnyObject, b:AnyObject) => number;
  send: (type: string, data: string | string[]) => void;
  reportExactHP: boolean;
  prng: PRNG;
  supportCancel: true;
  //* We only have one log, can't get other players choices? 
  inputLog: string[];
  //* Never in the middle of an event
  eventDepth: number;

  //* Inside format.gen
  gen: Generation;
  //* No random teams
  teamGenerator: null; // etc...
  //* Inherent in format/rules or excluded (no random teams)
  formatData: AnyObject;
  //* The format from formatID;
  format: null; // etc...
  //* = format
  cachedFormat: Format;
  //* Just [p1, p2] side
  sides: [Side, Side];
  //* Always true
  reportPercentages: boolean;
  //* Battle is over if winner so no point
  winner: string;
  //* Ditto - not interested in ended/sentEnd. active == !ended pretty much?
  ended: boolean;
  sentEnd: boolean;
  active: boolean;
  //* Always true/can infer from turn number?
  started: boolean;
  //* always === '' anyway
  id: string;
  //* no mods other then what is inferred from gen
  currentMod: string;
  //* Don't care
  rated: boolean|string;
  //* Always = 0, unused?
  lastUpdate: number;
  //* Always = [], unused in favor of inputLog?
  messageLog: string[];
  //* Equal to this.log length when observed
  sentLogPos: number;
  //* Battles all have endless battle anyway
  staleWarned = boolean;
  //* ??? Unused? Pokemon has itemData instead?
  itemData: AnyObject;
  //* Constant table of Type -> Move Name in data/scripts.js in gen7
  zMoveTable: {[k: string]: string};
  // Always = 0 after started = true, used for parity with Pokemon? (see itemData for similar?)
  activeTurns: number;
}

interface ActiveMove extends BasicEffect, MoveData {
	readonly effectType: 'Move'
	ability?: Ability
	aerilateBoosted?: boolean
	allies?: Pokemon[]
	auraBooster?: Pokemon
	causedCrashDamage?: boolean
	crit?: boolean
	forceStatus?: string
	galvanizeBoosted?: boolean
	hasAuraBreak?: boolean
	hasBounced?: boolean
	hasSheerForce?: boolean
	hit: number
	isExternal?: boolean
	/**
	 * Has this move been boosted by a Z-crystal? Usually the same as
	 * `isZ`, but hacked moves will have this be `false` and `isZ` be
	 * truthy.
	 */
	isZPowered?: boolean
	lastHit?: boolean
	magnitude?: number
	negateSecondary?: boolean
	normalizeBoosted?: boolean
	pixilateBoosted?: boolean
	pranksterBoosted?: boolean
	refrigerateBoosted?: boolean
	selfDropped?: boolean
	spreadHit?: boolean
	stab?: number
	statusRoll?: string
	totalDamage?: number | false
	typeMod: number
	willChangeForme?: boolean
	/**
	 * Whether or not this move is a Z-Move that broke protect
	 * (affects damage calculation).
	 * @type {boolean}
	 */
	zBrokeProtect?: boolean
}
