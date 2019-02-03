export type PersistentEffect<T> {
  type: T
  id: ID;
  duration?: number;
  source?: Pokemon;
  sourcePosition?: number;
}
