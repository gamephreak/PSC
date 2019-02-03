
export type Stat = 'hp'|'atk'|'def'|'spa'|'spd'|'spe';

export type StatsTable = {
  hp: number,
  atk: number,
  def: number,
  spe: number,
  spa: number,
  spd: number,
};

interface ObservedPokemon {
  item?: string;
  ability?: string;
  baseStats: StatsTable;
  approxCurHP: number;
}

interface PerceivedPokemon extends ObservedPokemon {
  items: Set<string>;
  abilities: Set<string>;
  minStats: StatsTable;
  maxStats: StatsTable;
}

interface Pokemon extends ObservedPokemon {
  nature: string;
  curHP: number;
}

interface Side<P extends ObservedPokemon> {
  party: P[];
  conditions: string[];
}

interface Field {
  weather?: string;
  terrain?: string;
}

interface State<P1 extends ObservedPokemon, P2 extends ObservedPokemon> {
  gen: number;
  field: Field;
  p1: Side<P1>;
  p2: Side<P2>;
}

type ReplayState = State<ObservedPokemon, ObservedPokemon>;
type ObservedState = State<Pokemon, ObservedPokemon>;
type PerceivedState = State<Pokemon, PerceivedPokemon>;
type ActualState = State<Pokemon, Pokemon>;
