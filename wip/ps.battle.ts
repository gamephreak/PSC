interface AnyObject {[k: string]: any}

type Effect = Ability | Item | ActiveMove | Template | PureEffect | Format
type GameType = 'singles' | 'doubles' | 'triples' | 'rotation'

type FaintedPokemon {
  target: Pokemon;
  source?: Pokemon;
  effect?: Effect;
}

interface Battle {
  LEGACY_API_DO_NOT_USE: boolean;
  NOT_FAILURE: '';
  abilityOrder: number;
  active: boolean;
  activeMove?: ActiveMove;
  activePokemon?: Pokemon;
  activeTarget?: Pokemon;
  activeTurns: number;
  cachedFormat: Format;
  comparePriority = (a:AnyObject, b:AnyObject) => number;
  currentMod: string;
  currentRequest: string;
  debugMode: boolean;
  effect: Effect;
  effectData: AnyObject;
  ended: boolean;
  event: AnyObject; // {target?: Pokemon, source?: Pokemon, modifier?: number, ceilModifier?: number }
  eventDepth: number;
  events?: AnyObject;
  faintQueue: FaintedPokemon[];
  firstStaleWarned: boolean;
  format: ID;
  formatData: AnyObject;
  formatid: ID;
  gameType: GameType;
  gen: Generation;
  id: string;
  inputLog: string[];
  itemData: AnyObject;
  lastDamage: number;
  lastMove?: Move;
  lastMoveLine: number;
  lastUpdate: number;
  log: string[];
  messageLog: string[];
  midTurn: boolean;
  p1: Side;
  p2: Side;
  prng: PRNG;
  prngSeed: [number, number, number, number];
  pseudoWeather: AnyObject;
  rated: boolean|string;
  reportExactHP: boolean;
  reportPercentages: boolean;
  send: (type: string, data: string | string[]) => void;
  sentEnd: boolean;
  sentLogPos: number;
  sides: [Side, Side];
  staleWarned = boolean;
  started: boolean;
  supportCancel: true;
  teamGenerator: null; // TODO;
  terrain: Terrain;
  terrainData: AnyObject;
  turn: number;
  weather: Weather;
  weatherData: AnyObject;
  winner: string;
  zMoveTable: {[k: string]: string};
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
