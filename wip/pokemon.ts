export type Status = 'par'|'psn'|'frz'|'slp'|'brn';

// dmgcalc

import {Gender, POKEDEX, Species} from './data/pokedex';
import {Type} from './data/types';
import {Generation} from './gen';
import {calcStat, DVToIV, getHPDV, Stat, STATS, StatsTable} from './stats';
import {extend, include} from './util';

export type Status = 'Healthy'|'Paralyzed'|'Poisoned'|'Badly Poisoned'|'Burned'|
    'Asleep'|'Frozen';

export type Pokemon {
  name: string;
  type1: Type;
  type2?: Type;
  weight: number;
  level: number;
  gender?: Gender;
  ability?: string;
  item?: string;
  nature: string;
  ivs: StatsTable;
  evs: StatsTable;
  boosts: StatsTable;
  stats: StatsTable;
  curHP: number;
  status: Status;
  toxicCounter: number;
}


// PS
/**
 * An object representing a Pokemon's move
 *
 * @typedef {Object} MoveSlot
 * @property {string} move
 * @property {string} id
 * @property {number} pp
 * @property {number} maxpp
 * @property {string} [target]
 * @property {string | boolean} disabled
 * @property {string} [disabledSource]
 * @property {boolean} used
 * @property {boolean} [virtual]
 */
class Pokemon {
	/**
	 * @param {string | AnyObject} set
	 * @param {Side} side
	 */
	constructor(set, side) {
		/**@type {Side} */
		this.side = side;
		/**@type {Battle} */
		this.battle = side.battle;

		let pokemonScripts = this.battle.data.Scripts.pokemon;
		if (pokemonScripts) Object.assign(this, pokemonScripts);

		if (typeof set === 'string') set = {name: set};

		// "pre-bound" functions for nicer syntax
		// allows them to be passed directly to Battle#add
		this.getHealth = (/**@param {Side} side */side => this.getHealthInner(side));
		this.getDetails = (/**@param {Side} side */side => this.getDetailsInner(side));

		/** @type {PokemonSet} */
		// @ts-ignore
		this.set = set;

		this.baseTemplate = this.battle.getTemplate(set.species || set.name);
		if (!this.baseTemplate.exists) {
			throw new Error(`Unidentified species: ${this.baseTemplate.name}`);
		}
		this.species = this.battle.getSpecies(set.species);
		if (set.name === set.species || !set.name) {
			set.name = this.baseTemplate.baseSpecies;
		}
		this.name = set.name.substr(0, 20);
		this.speciesid = toId(this.species);
		this.template = this.baseTemplate;
		this.movepp = {};
		/**@type {MoveSlot[]} */
		this.moveSlots = [];
		/**@type {MoveSlot[]} */
		this.baseMoveSlots = [];
		/**@type {StatsTable} */
		// @ts-ignore - null used for this.formeChange(this.baseTemplate)
		this.baseStats = null;

		/**@type {boolean | "hidden"} */
		this.trapped = false;
		this.maybeTrapped = false;
		this.maybeDisabled = false;
		/**@type {?Pokemon} */
		this.illusion = null;
		this.fainted = false;
		this.faintQueued = false;
		this.lastItem = '';
		this.ateBerry = false;
		/**@type {string} */
		this.status = '';
		this.position = 0;

		/**
		 * If the switch is called by an effect with a special switch
		 * message, like U-turn or Baton Pass, this will be the fullname of
		 * the calling effect.
		 * @type {boolean | string}
		 */
		this.switchFlag = false;
		this.forceSwitchFlag = false;
		this.switchCopyFlag = false;
		/**@type {?number} */
		this.draggedIn = null;

		/**@type {?Move} */
		this.lastMove = null;
		/**@type {string | boolean} */
		this.moveThisTurn = '';

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
		 * @type {boolean | null | undefined}
		 */
		this.moveLastTurnResult = undefined;
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
		 * @type {boolean | null | undefined}
		 */
		this.moveThisTurnResult = undefined;

		/** used for Assurance check */
		this.hurtThisTurn = false;
		this.lastDamage = 0;
		/**@type {{source: Pokemon, damage: number, thisTurn: boolean, move?: string}[]} */
		this.attackedBy = [];
		this.usedItemThisTurn = false;
		this.newlySwitched = false;
		this.beingCalledBack = false;
		this.isActive = false;
		this.activeTurns = 0;
		/** Have this pokemon's Start events run yet? */
		this.isStarted = false;
		this.transformed = false;
		this.duringMove = false;
		this.speed = 0;
		this.abilityOrder = 0;

		set.level = this.battle.clampIntRange(set.forcedLevel || set.level || 100, 1, 9999);
		this.level = set.level;

		let genders = {M: 'M', F: 'F', N: 'N'};
		/**@type {GenderName} */
		// @ts-ignore
		this.gender = genders[set.gender] || this.template.gender || (this.battle.random() * 2 < 1 ? 'M' : 'F');
		if (this.gender === 'N') this.gender = '';
		this.happiness = typeof set.happiness === 'number' ? this.battle.clampIntRange(set.happiness, 0, 255) : 255;
		this.pokeball = this.set.pokeball || 'pokeball';

		this.fullname = this.side.id + ': ' + this.name;
		this.details = this.species + (this.level === 100 ? '' : ', L' + this.level) + (this.gender === '' ? '' : ', ' + this.gender) + (this.set.shiny ? ', shiny' : '');

		this.id = this.fullname; // shouldn't really be used anywhere

		/**@type {AnyObject} */
		this.statusData = {};
		/**@type {AnyObject} */
		this.volatiles = {};

		this.heightm = this.template.heightm;
		this.weightkg = this.template.weightkg;

		/**@type {string} */
		this.baseAbility = toId(set.ability);
		this.ability = this.baseAbility;
		this.item = toId(set.item);
		/**@type {{[k: string]: string | Pokemon}} */
		this.abilityData = {id: this.ability};
		/**@type {{[k: string]: string | Pokemon}} */
		this.itemData = {id: this.item};
		this.speciesData = {id: this.speciesid};

		/**@type {string[]} */
		this.types = this.baseTemplate.types;
		/**@type {string} */
		this.addedType = '';
		/**@type {boolean} */
		this.knownType = true;

		if (this.set.moves) {
			for (const moveid of this.set.moves) {
				let move = this.battle.getMove(moveid);
				if (!move.id) continue;
				if (move.id === 'hiddenpower' && move.type !== 'Normal') {
					if (!set.hpType) set.hpType = move.type;
					move = this.battle.getMove('hiddenpower');
				}
				this.baseMoveSlots.push({
					move: move.name,
					id: move.id,
					pp: ((move.noPPBoosts || move.isZ) ? move.pp : move.pp * 8 / 5),
					maxpp: ((move.noPPBoosts || move.isZ) ? move.pp : move.pp * 8 / 5),
					target: move.target,
					disabled: false,
					disabledSource: '',
					used: false,
				});
			}
		}

		/** @type {string | null | undefined} */
		this.canMegaEvo = this.battle.canMegaEvo(this);
		/** @type {string | null | undefined} */
		this.canUltraBurst = this.battle.canUltraBurst(this);

		if (!this.set.evs) {
			this.set.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
		}
		if (!this.set.ivs) {
			this.set.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
		}
		let stats = {hp: 31, atk: 31, def: 31, spe: 31, spa: 31, spd: 31};
		for (let i in stats) {
			// @ts-ignore
			if (!this.set.evs[i]) this.set.evs[i] = 0;
			// @ts-ignore
			if (!this.set.ivs[i] && this.set.ivs[i] !== 0) this.set.ivs[i] = 31;
		}
		for (let i in this.set.evs) {
			// @ts-ignore
			this.set.evs[i] = this.battle.clampIntRange(this.set.evs[i], 0, 255);
		}
		for (let i in this.set.ivs) {
			// @ts-ignore
			this.set.ivs[i] = this.battle.clampIntRange(this.set.ivs[i], 0, 31);
		}
		if (this.battle.gen && this.battle.gen <= 2) {
			// We represent DVs using even IVs. Ensure they are in fact even.
			for (let i in this.set.ivs) {
				// @ts-ignore Typescript bug: [js] Object is possibly 'undefined'. (It's not, we just set them all in the last loop.)
				this.set.ivs[i] &= 30;
			}
		}

		let hpData = this.battle.getHiddenPower(this.set.ivs);
		/**@type {string} */
		this.hpType = set.hpType || hpData.type;
		/**@type {number} */
		this.hpPower = hpData.power;

		/**@type {BoostsTable} */
		this.boosts = {atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0};
		/**@type {{[k: string]: number}} */
		this.stats = {atk: 0, def: 0, spa: 0, spd: 0, spe: 0};

		// This is used in gen 1 only, here to avoid code repetition.
		// Only declared if gen 1 to avoid declaring an object we aren't going to need.
		if (this.battle.gen === 1) this.modifiedStats = {atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
		/**@type {?boolean} */
		this.subFainted = null;

		this.isStale = 0;
		this.isStaleCon = 0;
		this.isStaleHP = this.maxhp;
		this.isStalePPTurns = 0;

		// Transform copies IVs in gen 4 and earlier, so we track the base IVs/HP-type/power
		this.baseIvs = this.set.ivs;
		this.baseHpType = this.hpType;
		this.baseHpPower = this.hpPower;

		this.clearVolatile();

		/**
		 * Keeps track of what type the client sees for this Pokemon
		 * @type {string}
		 */
		this.apparentType = this.baseTemplate.types.join('/');

		/**@type {number} */
		this.maxhp = this.template.maxHP || this.baseStats.hp;
		/**@type {number} */
		this.hp = this.hp || this.maxhp;

		this.staleWarned = false;
		this.showCure = false;
	}
}


// PSC

export type Pokemon {
	name = '';
	species = '';

	/**
	 * A string representing information extractable from textual
	 * messages: side, nickname.
	 *
	 * Will be the empty string between Team Preview and the first
	 * switch-in.
	 *
	 * Examples: `p1: Unown` or `p2: Sparky`
	 */
	ident = '';
	/**
	 * A string representing visible information not included in
	 * ident: species, level, gender, shininess. Level is left off
	 * if it's 100; gender is left off if it's genderless.
	 *
	 * Note: Can be partially filled out in Team Preview, because certain
	 * forme information and shininess isn't visible there. In those
	 * cases, details can change during the first switch-in, but will
	 * otherwise not change over the course of a game.
	 *
	 * Examples: `Mimikyu, L50, F`, `Steelix, M, shiny`
	 */
	details = '';
	/**
	 * `` `${ident}|${details}` ``. Tracked for ease of searching.
	 *
	 * As with ident and details, will only change during the first
	 * switch-in.
	 */
	searchid = '';

	side: Side;
	slot = 0;

	fainted = false;
	hp = 0;
	maxhp = 1000;
	level = 100;
	gender: GenderName = 'N';
	shiny = false;

	hpcolor: HPColor = 'g';
	moves: string[] = [];
	ability = '';
	baseAbility = '';
	item = '';
	itemEffect = '';
	prevItem = '';
	prevItemEffect = '';

	boosts: {[stat: string]: number} = {};
	status: StatusName | 'tox' | '' | '???' = '';
	statusStage = 0;
	volatiles: EffectTable = {};
	turnstatuses: EffectTable = {};
	movestatuses: EffectTable = {};
	weightkg = 0;
	lastMove = '';

	/** [[moveName, ppUsed]] */
	moveTrack: [string, number][] = [];
	statusData = {sleepTurns: 0, toxicTurns: 0};

	sprite: PokemonSprite;
}











// dmgcalc







export class Pokemon {
  name: string;
  type1: Type;
  type2?: Type;
  weight: number;
  level: number;
  gender?: Gender;
  ability?: string;
  item?: string;
  nature: string;
  ivs: StatsTable;
  evs: StatsTable;
  boosts: StatsTable;
  stats: StatsTable;
  curHP: number;
  status: Status;
  toxicCounter: number;

  private gen: Generation;
  private species: Species;

  constructor(
      gen: Generation, name: string, level?: number, gender?: Gender,
      ability?: string, item?: string, nature?: string,
      ivs?: Partial<StatsTable>, evs?: Partial<StatsTable>,
      boosts?: Partial<StatsTable>, curHP?: number, status?: Status,
      toxicCounter?: number) {
    this.gen = gen;
    this.name = name;
    this.species = POKEDEX[gen][name];

    this.type1 = this.species.type1;
    this.type2 = this.species.type2;
    this.weight = this.species.weight;

    this.level = level || 100;
    this.gender = gender || this.species.gender;
    this.item = item;
    this.ability = ability || this.species.ability ||
        (this.species.abilities && this.species.abilities['0']);
    this.nature = nature || 'Serious';

    this.ivs = this.withDefault_(gen, ivs, 31);
    this.evs = this.withDefault_(gen, evs, gen >= 3 ? 0 : 252);
    this.boosts = this.withDefault_(gen, boosts, 0);

    if (gen < 3 && typeof this.ivs.spc !== 'undefined') {
      this.ivs.hp = DVToIV(getHPDV({
        atk: this.ivs.atk,
        def: this.ivs.def,
        spe: this.ivs.spe,
        spc: this.ivs.spc
      }));
    }

    this.stats = {} as StatsTable;
    for (const stat of STATS[gen]) {
      this.stats[stat] = this.calcStat_(gen, stat);
    }

    this.curHP = (curHP && curHP <= this.maxHP) ? curHP : this.maxHP;
    this.status = status || 'Healthy';
    this.toxicCounter = toxicCounter || 0;
  }

  get maxHP() {
    return this.stats.hp;
  }

  hasType(type: Type) {
    return this.type1 === type || this.type2 === type;
  }

  copy() {
    return new Pokemon(
        this.gen, this.name, this.level, this.gender, this.ability, this.item,
        this.nature, this.ivs, this.evs, this.boosts, this.curHP, this.status,
        this.toxicCounter);
  }

  calcStat_(gen: Generation, stat: Stat) {
    return calcStat(
        gen, stat, this.species.baseStats[stat]!, this.ivs[stat]!,
        this.evs[stat]!, this.level, this.nature);
  }

  withDefault_(
      gen: Generation, current: Partial<StatsTable>|undefined, val: number) {
    return extend(
        true, {}, {'hp': val, 'atk': val, 'def': val, 'spe': val},
        gen < 3 ? {'spc': val} : {'spa': val, 'spd': val}, current);
  }

  static getForme(
      gen: Generation, speciesName: string, item?: string, moveName?: string) {
    const species = POKEDEX[gen][speciesName];
    if (!species || !species.formes) {
      return speciesName;
    }

    let i = 0;
    if (item &&
            ((include(item, 'ite') && !include(item, 'ite Y')) ||
             (speciesName === 'Groudon' && item === 'Red Orb') ||
             (speciesName === 'Kyogre' && item === 'Blue Orb')) ||
        (moveName &&
             (speciesName === 'Meloetta' && moveName === 'Relic Song') ||
         (speciesName === 'Rayquaza' && moveName === 'Dragon Ascent'))) {
      i = 1;
    } else if (item && include(item, 'ite Y')) {
      i = 2;
    }

    return species.formes[i];
  }
}


// PSC


/** [id, element?, ...misc] */
type EffectState = any[] & {0: ID};
/** [name, minTimeLeft, maxTimeLeft] */
type EffectTable = {[effectid: string]: EffectState};
type HPColor = 'r' | 'y' | 'g';

class Pokemon {
	name = '';
	species = '';

	/**
	 * A string representing information extractable from textual
	 * messages: side, nickname.
	 *
	 * Will be the empty string between Team Preview and the first
	 * switch-in.
	 *
	 * Examples: `p1: Unown` or `p2: Sparky`
	 */
	ident = '';
	/**
	 * A string representing visible information not included in
	 * ident: species, level, gender, shininess. Level is left off
	 * if it's 100; gender is left off if it's genderless.
	 *
	 * Note: Can be partially filled out in Team Preview, because certain
	 * forme information and shininess isn't visible there. In those
	 * cases, details can change during the first switch-in, but will
	 * otherwise not change over the course of a game.
	 *
	 * Examples: `Mimikyu, L50, F`, `Steelix, M, shiny`
	 */
	details = '';
	/**
	 * `` `${ident}|${details}` ``. Tracked for ease of searching.
	 *
	 * As with ident and details, will only change during the first
	 * switch-in.
	 */
	searchid = '';

	side: Side;
	slot = 0;

	fainted = false;
	hp = 0;
	maxhp = 1000;
	level = 100;
	gender: GenderName = 'N';
	shiny = false;

	hpcolor: HPColor = 'g';
	moves: string[] = [];
	ability = '';
	baseAbility = '';
	item = '';
	itemEffect = '';
	prevItem = '';
	prevItemEffect = '';

	boosts: {[stat: string]: number} = {};
	status: StatusName | 'tox' | '' | '???' = '';
	statusStage = 0;
	volatiles: EffectTable = {};
	turnstatuses: EffectTable = {};
	movestatuses: EffectTable = {};
	weightkg = 0;
	lastMove = '';

	/** [[moveName, ppUsed]] */
	moveTrack: [string, number][] = [];
	statusData = {sleepTurns: 0, toxicTurns: 0};

	sprite: PokemonSprite;

	constructor(data: any, side: Side) {
		this.side = side;
		this.species = data.species;

		// TODO: stop doing this
		Object.assign(this, Dex.getTemplate(data.species));
		Object.assign(this, data);

		this.sprite = side.battle.scene.addPokemonSprite(this);
	}

	isActive() {
		return this.side.active.includes(this);
	}

	getIdent() {
		let slots = ['a', 'b', 'c', 'd', 'e', 'f'];
		return this.ident.substr(0, 2) + slots[this.slot] + this.ident.substr(2);
	}
	removeVolatile(volatile: ID) {
		this.side.battle.scene.removeEffect(this, volatile);
		if (!this.hasVolatile(volatile)) return;
		delete this.volatiles[volatile];
	}
	addVolatile(volatile: ID, ...args: any[]) {
		if (this.hasVolatile(volatile) && !args.length) return;
		this.volatiles[volatile] = [volatile, ...args] as EffectState;
		this.side.battle.scene.addEffect(this, volatile);
	}
	hasVolatile(volatile: ID) {
		return !!this.volatiles[volatile];
	}
	removeTurnstatus(volatile: ID) {
		this.side.battle.scene.removeEffect(this, volatile);
		if (!this.hasTurnstatus(volatile)) return;
		delete this.turnstatuses[volatile];
	}
	addTurnstatus(volatile: ID) {
		volatile = toId(volatile);
		this.side.battle.scene.addEffect(this, volatile);
		if (this.hasTurnstatus(volatile)) return;
		this.turnstatuses[volatile] = [volatile];
	}
	hasTurnstatus(volatile: ID) {
		return !!this.turnstatuses[volatile];
	}
	clearTurnstatuses() {
		for (let id in this.turnstatuses) {
			this.removeTurnstatus(id as ID);
		}
		this.turnstatuses = {};
	}
	removeMovestatus(volatile: ID) {
		this.side.battle.scene.removeEffect(this, volatile);
		if (!this.hasMovestatus(volatile)) return;
		delete this.movestatuses[volatile];
	}
	addMovestatus(volatile: ID) {
		volatile = toId(volatile);
		if (this.hasMovestatus(volatile)) return;
		this.movestatuses[volatile] = [volatile];
		this.side.battle.scene.addEffect(this, volatile);
	}
	hasMovestatus(volatile: ID) {
		return !!this.movestatuses[volatile];
	}
	clearMovestatuses() {
		for (let id in this.movestatuses) {
			this.removeMovestatus(id as ID);
		}
		this.movestatuses = {};
	}
	clearVolatiles() {
		this.volatiles = {};
		this.clearTurnstatuses();
		this.clearMovestatuses();
		this.side.battle.scene.clearEffects(this);
	}
	rememberMove(moveName: string, pp = 1, recursionSource?: string) {
		if (recursionSource === this.ident) return;
		moveName = Dex.getMove(moveName).name;
		if (moveName.charAt(0) === '*') return;
		if (moveName === 'Struggle') return;
		if (this.volatiles.transform) {
			// make sure there is no infinite recursion if both Pokemon are transformed into each other
			if (!recursionSource) recursionSource = this.ident;
			this.volatiles.transform[1].rememberMove(moveName, 0, recursionSource);
			moveName = '*' + moveName;
		}
		for (const entry of this.moveTrack) {
			if (moveName === entry[0]) {
				entry[1] += pp;
				if (entry[1] < 0) entry[1] = 0;
				return;
			}
		}
		this.moveTrack.push([moveName, pp]);
	}
	rememberAbility(ability: string, isNotBase?: boolean) {
		ability = Dex.getAbility(ability).name;
		this.ability = ability;
		if (!this.baseAbility && !isNotBase) {
			this.baseAbility = ability;
		}
	}
	getBoost(boostStat: BoostStatName) {
		let boostStatTable = {
			atk: 'Atk',
			def: 'Def',
			spa: 'SpA',
			spd: 'SpD',
			spe: 'Spe',
			accuracy: 'Accuracy',
			evasion: 'Evasion',
			spc: 'Spc',
		};
		if (!this.boosts[boostStat]) {
			return '1&times;&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 6) this.boosts[boostStat] = 6;
		if (this.boosts[boostStat] < -6) this.boosts[boostStat] = -6;
		if (boostStat === 'accuracy' || boostStat === 'evasion') {
			if (this.boosts[boostStat] > 0) {
				let goodBoostTable = ['1&times;', '1.33&times;', '1.67&times;', '2&times;', '2.33&times;', '2.67&times;', '3&times;'];
				// let goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
				return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
			}
			let badBoostTable = ['1&times;', '0.75&times;', '0.6&times;', '0.5&times;', '0.43&times;', '0.38&times;', '0.33&times;'];
			// let badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
			return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 0) {
			let goodBoostTable = ['1&times;', '1.5&times;', '2&times;', '2.5&times;', '3&times;', '3.5&times;', '4&times;'];
			// let goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
			return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		let badBoostTable = ['1&times;', '0.67&times;', '0.5&times;', '0.4&times;', '0.33&times;', '0.29&times;', '0.25&times;'];
		// let badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
		return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
	}

	clearVolatile() {
		this.ability = this.baseAbility;
		if (window.BattlePokedex && BattlePokedex[this.species] && BattlePokedex[this.species].weightkg) {
			this.weightkg = BattlePokedex[this.species].weightkg;
		}
		this.boosts = {};
		this.clearVolatiles();
		for (let i = 0; i < this.moveTrack.length; i++) {
			if (this.moveTrack[i][0].charAt(0) === '*') {
				this.moveTrack.splice(i, 1);
				i--;
			}
		}
		// this.lastMove = '';
		this.statusStage = 0;
		this.statusData.toxicTurns = 0;
		if (this.side.battle.gen === 5) this.statusData.sleepTurns = 0;
	}
	/**
	 * copyAll = false means Baton Pass,
	 * copyAll = true means Illusion breaking
	 */
	copyVolatileFrom(pokemon: Pokemon, copyAll?: boolean) {
		this.boosts = pokemon.boosts;
		this.volatiles = pokemon.volatiles;
		// this.lastMove = pokemon.lastMove; // I think
		if (!copyAll) {
			delete this.volatiles['airballoon'];
			delete this.volatiles['attract'];
			delete this.volatiles['autotomize'];
			delete this.volatiles['disable'];
			delete this.volatiles['encore'];
			delete this.volatiles['foresight'];
			delete this.volatiles['imprison'];
			delete this.volatiles['mimic'];
			delete this.volatiles['miracleeye'];
			delete this.volatiles['nightmare'];
			delete this.volatiles['smackdown'];
			delete this.volatiles['stockpile1'];
			delete this.volatiles['stockpile2'];
			delete this.volatiles['stockpile3'];
			delete this.volatiles['torment'];
			delete this.volatiles['typeadd'];
			delete this.volatiles['typechange'];
			delete this.volatiles['yawn'];
		}
		delete this.volatiles['transform'];
		delete this.volatiles['formechange'];

		pokemon.boosts = {};
		pokemon.volatiles = {};
		pokemon.side.battle.scene.removeTransform(pokemon);
		pokemon.statusStage = 0;
	}
	copyTypesFrom(pokemon: Pokemon) {
		const [types, addedType] = pokemon.getTypes();
		this.addVolatile('typechange' as ID, types.join('/'));
		if (addedType) {
			this.addVolatile('typeadd' as ID, addedType);
		} else {
			this.removeVolatile('typeadd' as ID);
		}
	}
	getTypes(): [string[], string] {
		let types;
		if (this.volatiles.typechange) {
			types = this.volatiles.typechange[1].split('/');
		} else {
			const species = this.getSpecies();
			types = (
				window.BattleTeambuilderTable &&
				window.BattleTeambuilderTable['gen' + this.side.battle.gen] &&
				window.BattleTeambuilderTable['gen' + this.side.battle.gen].overrideType[toId(species)]
			);
			if (types) types = types.split('/');
			if (!types) types = Dex.getTemplate(species).types || [];
		}
		const addedType = (this.volatiles.typeadd ? this.volatiles.typeadd[1] : '');
		return [types, addedType];
	}
	getSpecies(): string {
		return this.volatiles.formechange ? this.volatiles.formechange[1] : this.species;
	}
	reset() {
		this.clearVolatile();
		this.hp = this.maxhp;
		this.fainted = false;
		this.status = '';
		this.moveTrack = [];
		this.name = this.name || this.species;
	}
	destroy() {
		if (this.sprite) this.sprite.destroy();
		this.sprite = null!;
		this.side = null!;
	}
}

// PS
