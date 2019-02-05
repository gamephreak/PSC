import {PersistentEffect} from './effect';

export type Terrain = 'Electric'|'Grassy'|'Psychic'|'Misty';

export type Weather =
    'Sand'|'Sun'|'Rain'|'Hail'|'Harsh Sunshine'|'Heavy Rain'|'Strong Winds';

export type PseudoWeather = 'Gravity'|'Trick Room'|'Magic Room'|'Wonder Room'|
    'Fairy Lock'|'Ion Deluge'|'Mud Sport'|'Water Sport'|'Echoed Voice';

export interface TerrainData extends PersistentEffect<Terrain> {}
export interface WeatherData extends PersistentEffect<Weather> {}

export interface PseudoWeatherData extends PersistentEffect<PseudoWeather> {
  multiplier?: number;  // Echoed Voice
}

export interface Field {
  terrain?: TerrainData;
  weather?: WeatherData;
  pseudoWeather?: {[id: string]: PseudoWeatherData};
}
