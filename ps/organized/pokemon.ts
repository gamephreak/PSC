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

	getHPColor(): HPColor {
		if (this.hpcolor) return this.hpcolor;
		let ratio = this.hp / this.maxhp;
		if (ratio > 0.5) return 'g';
		if (ratio > 0.2) return 'y';
		return 'r';
	}
	getHPColorClass() {
		switch (this.getHPColor()) {
		case 'y': return ' hpbar-yellow';
		case 'r': return ' hpbar-red';
		}
		return '';
	}
	getPixelRange(pixels: number, color: HPColor): [number, number] {
		let epsilon = 0.5 / 714;

		if (pixels === 0) return [0, 0];
		if (pixels === 1) return [0 + epsilon, 2 / 48 - epsilon];
		if (pixels === 9) {
			if (color === 'y') { // ratio is > 0.2
				return [0.2 + epsilon, 10 / 48 - epsilon];
			} else { // ratio is <= 0.2
				return [9 / 48, 0.2];
			}
		}
		if (pixels === 24) {
			if (color === 'g') { // ratio is > 0.5
				return [0.5 + epsilon, 25 / 48 - epsilon];
			} else { // ratio is exactly 0.5
				return [0.5, 0.5];
			}
		}
		if (pixels === 48) return [1, 1];

		return [pixels / 48, (pixels + 1) / 48 - epsilon];
	}
	getFormattedRange(range: [number, number], precision: number, separator: string) {
		if (range[0] === range[1]) {
			let percentage = Math.abs(range[0] * 100);
			if (Math.floor(percentage) === percentage) {
				return percentage + '%';
			}
			return percentage.toFixed(precision) + '%';
		}
		let lower;
		let upper;
		if (precision === 0) {
			lower = Math.floor(range[0] * 100);
			upper = Math.ceil(range[1] * 100);
		} else {
			lower = (range[0] * 100).toFixed(precision);
			upper = (range[1] * 100).toFixed(precision);
		}
		return '' + lower + separator + upper + '%';
	}
	// Returns [min, max] damage dealt as a proportion of total HP from 0 to 1
	getDamageRange(damage: any): [number, number] {
		if (damage[1] !== 48) {
			let ratio = damage[0] / damage[1];
			return [ratio, ratio];
		} else if (damage.length === undefined) {
			// wrong pixel damage.
			// this case exists for backward compatibility only.
			return [damage[2] / 100, damage[2] / 100];
		}
		// pixel damage
		let oldrange = this.getPixelRange(damage[3], damage[4]);
		let newrange = this.getPixelRange(damage[3] + damage[0], this.hpcolor);
		if (damage[0] === 0) {
			// no change in displayed pixel width
			return [0, newrange[1] - newrange[0]];
		}
		if (oldrange[0] < newrange[0]) { // swap order
			let r = oldrange;
			oldrange = newrange;
			newrange = r;
		}
		return [oldrange[0] - newrange[1], oldrange[1] - newrange[0]];
	}
	healthParse(hpstring: string, parsedamage?: boolean, heal?: boolean):
		[number, number, number] | [number, number, number, number, HPColor] | null {
		// returns [delta, denominator, percent(, oldnum, oldcolor)] or null
		if (!hpstring || !hpstring.length) return null;
		let parenIndex = hpstring.lastIndexOf('(');
		if (parenIndex >= 0) {
			// old style damage and health reporting
			if (parsedamage) {
				let damage = parseFloat(hpstring);
				// unusual check preseved for backward compatbility
				if (isNaN(damage)) damage = 50;
				if (heal) {
					this.hp += this.maxhp * damage / 100;
					if (this.hp > this.maxhp) this.hp = this.maxhp;
				} else {
					this.hp -= this.maxhp * damage / 100;
				}
				// parse the absolute health information
				let ret = this.healthParse(hpstring);
				if (ret && (ret[1] === 100)) {
					// support for old replays with nearest-100th damage and health
					return [damage, 100, damage];
				}
				// complicated expressions preserved for backward compatibility
				let percent = Math.round(Math.ceil(damage * 48 / 100) / 48 * 100);
				let pixels = Math.ceil(damage * 48 / 100);
				return [pixels, 48, percent];
			}
			if (hpstring.substr(hpstring.length - 1) !== ')') {
				return null;
			}
			hpstring = hpstring.substr(parenIndex + 1, hpstring.length - parenIndex - 2);
		}

		let oldhp = this.fainted ? 0 : (this.hp || 1);
		let oldmaxhp = this.maxhp;
		let oldwidth = this.hpWidth(100);
		let oldcolor = this.hpcolor;

		this.side.battle.parseHealth(hpstring, this);
		if (oldmaxhp === 0) { // max hp not known before parsing this message
			oldmaxhp = oldhp = this.maxhp;
		}

		let oldnum = oldhp ? (Math.floor(this.maxhp * oldhp / oldmaxhp) || 1) : 0;
		let delta = this.hp - oldnum;
		let deltawidth = this.hpWidth(100) - oldwidth;
		return [delta, this.maxhp, deltawidth, oldnum, oldcolor];
	}
	checkDetails(details?: string) {
		if (!details) return false;
		if (details === this.details) return true;
		if (this.searchid) return false;
		if (details.indexOf(', shiny') >= 0) {
			if (this.checkDetails(details.replace(', shiny', ''))) return true;
		}
		// the actual forme was hidden on Team Preview
		details = details.replace(/(-[A-Za-z0-9]+)?(, |$)/, '-*$2');
		return (details === this.details);
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
	getBoostType(boostStat: BoostStatName) {
		if (!this.boosts[boostStat]) return 'neutral';
		if (this.boosts[boostStat] > 0) return 'good';
		return 'bad';
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
	// This function is used for two things:
	//   1) The percentage to display beside the HP bar.
	//   2) The width to draw an HP bar.
	//
	// This function is NOT used in the calculation of any other displayed
	// percentages or ranges, which have their own, more complex, formulae.
	hpWidth(maxWidth: number) {
		if (this.fainted || !this.hp) return 0;

		// special case for low health...
		if (this.hp === 1 && this.maxhp > 45) return 1;

		if (this.maxhp === 48) {
			// Draw the health bar to the middle of the range.
			// This affects the width of the visual health bar *only*; it
			// does not affect the ranges displayed in any way.
			let range = this.getPixelRange(this.hp, this.hpcolor);
			let ratio = (range[0] + range[1]) / 2;
			return Math.round(maxWidth * ratio) || 1;
		}
		let percentage = Math.ceil(100 * this.hp / this.maxhp);
		if ((percentage === 100) && (this.hp < this.maxhp)) {
			percentage = 99;
		}
		return percentage * maxWidth / 100;
	}
	hpDisplay(precision = 1) {
		if (this.maxhp === 100) return this.hp + '%';
		if (this.maxhp !== 48) return (100 * this.hp / this.maxhp).toFixed(precision) + '%';
		let range = this.getPixelRange(this.hp, this.hpcolor);
		return this.getFormattedRange(range, precision, '–');
	}
	destroy() {
		if (this.sprite) this.sprite.destroy();
		this.sprite = null!;
		this.side = null!;
	}
}
