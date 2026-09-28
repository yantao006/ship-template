// Widen copy values without erasing numeric limits, arrays, or optional properties.
// Checking both directions catches missing and orphaned keys in either locale.
export type MessageShape<T> = T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly unknown[] ? { [K in keyof T]: MessageShape<T[K]> }
  : T extends object ? { [K in keyof T]: MessageShape<T[K]> }
  : T;
