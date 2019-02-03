class Template implements Effect {
	// effect
	readonly effectType = 'Template';
	readonly id: ID;
	readonly name: string;
	readonly gen: number;
	readonly exists: boolean;

	// name
	readonly species: string;
	readonly speciesid: ID;
	readonly baseSpecies: string;
	readonly forme: string;
	readonly formeid: string;
	readonly spriteid: string;

	// basic data
	readonly num: number;
	readonly types: ReadonlyArray<TypeName>;
	readonly abilities: Readonly<{
		0: string, 1?: string, H?: string, S?: string,
	}>;
	readonly baseStats: Readonly<{
		hp: number, atk: number, def: number, spa: number, spd: number, spe: number,
	}>;
	readonly weightkg: number;

	// flavor data
	readonly heightm: number;
	readonly gender: GenderName;
	readonly color: string;
	readonly genderRatio: Readonly<{M: number, F: number}> | null;
	readonly eggGroups: ReadonlyArray<string>;

	// format data
	readonly otherFormes: ReadonlyArray<ID> | null;
	// TODO: rename to cosmeticForms
	readonly otherForms: ReadonlyArray<ID> | null;
	readonly evos: ReadonlyArray<ID> | null;
	readonly prevo: ID;
	readonly requiredItem: string;
	readonly tier: string;
	readonly isTotem: boolean;
	readonly isMega: boolean;
	readonly isPrimal: boolean;
	readonly battleOnly: boolean;
	readonly isNonstandard: boolean;
	readonly unreleasedHidden: boolean;

	constructor(id: ID, name: string, data: any) {
		if (!data || typeof data !== 'object') data = {};
		if (data.name || data.species) name = data.name || data.species;
		this.name = Dex.sanitizeName(name);
		this.id = id;
		this.gen = data.gen || 0;
		this.exists = ('exists' in data ? !!data.exists : true);
		this.species = this.name;
		this.speciesid = this.id;
		if (!data.abilities &&
			!['hooh', 'hakamoo', 'jangmoo', 'kommoo', 'porygonz'].includes(this.id)) {
			const dashIndex = name.indexOf('-');
			if (this.id === 'kommoototem') {
				data.baseSpecies = 'Kommo-o';
				data.forme = 'Totem';
			} else if (dashIndex > 0) {
				data.baseSpecies = name.slice(0, dashIndex);
				data.forme = name.slice(dashIndex + 1);
			}
		}
		if (!data.abilities) {
			// deprecated BattleBaseSpeciesChart
			for (const baseid of BattleBaseSpeciesChart) {
				if (this.id.length > baseid.length && this.id.slice(0, baseid.length) === baseid) {
					data.baseSpecies = baseid;
					data.forme = this.id.slice(baseid.length);
				}
			}
			if (this.id !== 'yanmega' && this.id.slice(-4) === 'mega') {
				data.baseSpecies = this.id.slice(0, -4);
				data.forme = this.id.slice(-4);
			} else if (this.id.slice(-6) === 'primal') {
				data.baseSpecies = this.id.slice(0, -6);
				data.forme = this.id.slice(-6);
			} else if (this.id.slice(-5) === 'alola') {
				data.baseSpecies = this.id.slice(0, -5);
				data.forme = this.id.slice(-5);
			}
		}
		this.baseSpecies = data.baseSpecies || name;
		this.forme = data.forme || '';
		const baseId = toId(this.baseSpecies);
		this.formeid = (baseId === this.id ? '' : '-' + toId(this.forme));
		this.spriteid = baseId + this.formeid;
		if (this.spriteid.slice(-5) === 'totem') this.spriteid = this.spriteid.slice(0, -5);
		if (this.spriteid.slice(-1) === '-') this.spriteid = this.spriteid.slice(0, -1);

		this.num = data.num || 0;
		this.types = data.types || ['???'];
		let abilities: any = {0: "No Ability"};
		this.abilities = data.abilities || {0: "No Ability"};
		this.baseStats = data.baseStats || {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
		this.weightkg = data.weightkg || 0;

		this.heightm = data.heightm || 0;
		this.gender = data.gender || '';
		this.color = data.color || '';
		this.genderRatio = data.genderRatio || null;
		this.eggGroups = data.eggGroups || [];

		this.otherFormes = data.otherFormes || null;
		this.otherForms = data.otherForms || null;
		this.evos = data.evos || null;
		this.prevo = data.prevo || '';
		this.requiredItem = data.requiredItem || '';
		this.tier = data.tier || '';

		this.isTotem = false;
		this.isMega = false;
		this.isPrimal = false;
		this.battleOnly = false;
		this.isNonstandard = !!data.isNonstandard;
		this.unreleasedHidden = !!data.unreleasedHidden;
		if (!this.gen) {
			if (this.forme && ['-mega', '-megax', '-megay'].includes(this.formeid)) {
				this.gen = 6;
				this.isMega = true;
				this.battleOnly = true;
			} else if (this.formeid === '-primal') {
				this.gen = 6;
				this.isPrimal = true;
				this.battleOnly = true;
			} else if (this.formeid === '-totem' || this.formeid === '-alolatotem') {
				this.gen = 7;
				this.isTotem = true;
			} else if (this.formeid === '-alola') {
				this.gen = 7;
			} else if (this.num >= 722) {
				this.gen = 7;
			} else if (this.num >= 650) {
				this.gen = 6;
			} else if (this.num >= 494) {
				this.gen = 5;
			} else if (this.num >= 387) {
				this.gen = 4;
			} else if (this.num >= 252) {
				this.gen = 3;
			} else if (this.num >= 152) {
				this.gen = 2;
			} else if (this.num >= 1) {
				this.gen = 1;
			}
		}
	}
}
