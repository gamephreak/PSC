export type Terrain = 'Electric'|'Grassy'|'Psychic'|'Misty';
export type Weather =
    'Sand'|'Sun'|'Rain'|'Hail'|'Harsh Sunshine'|'Heavy Rain'|'Strong Winds';

export interface Field {  // class
  terrain?: Terrain;
  weather?: Weather;
  gravity?: boolean;
  trickroom?: boolean;
}
