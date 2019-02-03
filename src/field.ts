import {PersistentEffect} from './effect';

export type Terrain = 'Electric'|'Grassy'|'Psychic'|'Misty';

export type Weather =
    'Sand'|'Sun'|'Rain'|'Hail'|'Harsh Sunshine'|'Heavy Rain'|'Strong Winds';

export type PseudoWeather =
  'Gravity'|'Trick Room'|'Magic Room'|'Wonder Room'|
  'Fairy Lock'|'Ion Deluge'|'Mud Sport'|'Water Sport';

export interface Field {
  terrain?: PersistentEffect<Terrain>;
  weather?: PersistentEffect<Weather>;
  pseudoWeather?: {[id: string]: PersistentEffect<PseudoWeather>};
}
