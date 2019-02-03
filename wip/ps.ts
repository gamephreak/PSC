interface AnyObject {[k: string]: any}

type Effect = Ability | Item | ActiveMove | Template | PureEffect | Format
type GameType = 'singles' | 'doubles' | 'triples' | 'rotation'

type Action = string; // TODO

type FaintedPokemon {
  target: Pokemon;
  source?: Pokemon;
  effect?: Effect;
}



type EffectData {
  target?: Pokemon|Side|Battle;
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
  queue:  Action[];
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


// An object representing a single action that can be chosen.

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

interface Side {
  active: Pokemon[]; // [Pokemon] | [Pokemon, Pokemon] | [Pokemon, Pokemon, Pokemon]
  avatar: string;
  battle: Battle;
  choice: Choice;
  currentRequest: 'move' | // begining of every turn
    'switch' | // end of turn with fainted or mid turn for u-turn, BP, etc
    'teampreview' | // begining of battle
    ''; // wait for other persons switch
  faintedLastTurn: boolean;
  faintedThisTurn: boolean;
  foe: Side;
  id: 'p1' | 'p2';
  lastMove?: Move;
  maxTeamSize: number;
  n: number;
  name: string;
  pokemon: Pokemon[];
  pokemonLeft: number;
  //sideConditions: AnyObject;
  team: PokemonSet[];
  zMoveUsed: boolean;
}

interface MoveSlot {
  disabledSource?: string;
  disabled: string|boolean;
  id: ID;
  maxpp: number;
  move: string;
  pp: number;
  target?: string;
  used: boolean;
  virtual?: boolean;

}
interface Pokemon {
  set: PokemonSet;
  side: Side;
  battle: Battle;
  baseTemplate: Template; // Species
  species: string; // Species.name
  name: string;
  speciesid: ID;
  template: Template; // Species

  movepp: Object; // TODO
  moveSlots: MoveSlot[];
  baseMoveSlots: MoveSlot[];
  baseStats: StatsTable; // numm used for this.formeChange(this.baseTemplate);

  trapped: boolean | "hidden";
  maybeTrapped: boolean;
  maybeDisabled: boolean;
  illusion?: Pokemon;
  fainted: boolean;
  faintQueued: boolean;
  lastItem: string; // ID
  ateBerry: boolean;
  status: string; // Status
  position: number;
  /**
   * If the switch is called by an effect with a special switch
   * message, like U-turn or Baton Pass, this will be the fullname of
   * the calling effect.
   * @type {boolean | string}
   */
  switchFlag: boolean|string;
  forceSwitchFlag: boolean; // |string?
  switchCopyFlag: boolean; // |string?
  draggedIn?: number;
  lastMove?: Move;
  moveThisTurn: string|boolean;
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
  hurtThisTurn: boolean;
  lastDamage: number;
  attackedBy: {source: Pokemon, damage: number, thisTurn: boolean, move?: string}[];
  usedItemThisTurn: boolean;
  newlySwitched: boolean;
  beingCalledBack: boolean;
  isActive: boolean;
  activeTurns: number;
  isStarted: boolean; // Have this pokemon's Start events run yet?
  transformed: boolean;
  duringMove: boolean;
  speed: number;
  abilityOrder: number;
  level: number;
  gender: 'M' | 'F' | '';
  happiness: number;
  pokeball: string;
  fullName: string; // p1: name
  details: string; // DETAILS
  id: string; // === fullName
  statusData: AnyObject;
  volatiles: AnyObject;
  heightm: number;
  weightkg: number;
  baseAbility: ID;
  ability: ID;
  item: ID;
  abilityData: {[k: string]: string | Pokemon};
  itemData: {[k: string]: string | Pokemon};
  speciesData: AnyObject;
  types: Type[]; // type1, type2
  addedType: Type;
  knownType: boolean;
  canMegaEvo = string | null | undefined;
  canUltraBurst = string | null | undefined;
  hpType: Type;
  hpPower: number;
  boosts: BoostsTable;
  stats: StatsTable;
  modifiedStats: StatsTable; // Gen1 only
  subFainted?: boolean;

  isStale: number;
  isStaleCon: number;
  isStaleHP: number;
  isStalePPTurns: number;
  staleWarned: boolean;

  // Transform copies IVs in gen 4 and earlier, so we track the base IVs/HP-type/power
  baseIvs: StatsTable;
  baseHpType: Type;
  baseHpPower: number;
  apparentType: string; // Type1(/Type2)
  maxhp: number;
  hp: number;
  showCure: boolean;
}

///////////////////////

// {[id: string]: WeatherData}
type WeatherData {
  id: ID;
  duration?: number;
  source?: Pokemon;
  sourcePosition?: number;
}

// {[id: string]: TerrainData}
type TerrainData {
  id: ID;
  duration?: number;
  source?: Pokemon;
  sourcePosition?: number;
}

// {[id: string]: PseudoWeather}
type PseudoWeather {
  id: ID;
  duration?: number;
  source?: Pokemon;
  sourcePosition?: number;
}

// {[id: string} => SideCondition}
interface SideCondition {
  target: Side;

  id: ID;
  duration?: number;
  source?: Pokemon;
  sourcePosition?: number;
}
