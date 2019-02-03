interface AnyObject {[k: string]: any}

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
  //* ??? ***********************
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
  //* REMOVED ***********************
}
