/** Level scripts. Each entry is something arriving at Bill: the time is when it
 *  reaches the strike zone, so the rhythm is the same on every screen size. */

export type SpawnType = 'car' | 'phone' | 'bus' | 'dog' | 'sign';

export interface Spawn { t: number; type: SpawnType }

export interface LevelDef {
  name: string;
  tagline: string;
  spawns: Spawn[];
}

/** Build a timeline from [gap since previous arrival, type] pairs. */
function timeline(parts: [number, SpawnType][]): Spawn[] {
  let t = 0;
  return parts.map(([gap, type]) => ({ t: (t += gap), type }));
}

export const HIGHWAY_JAM: LevelDef = {
  name: 'HIGHWAY JAM',
  tagline: 'Whack the rubberneckers. Clear the jam!',
  spawns: timeline([
    // learn to swing
    [5.0, 'car'], [2.6, 'car'], [2.2, 'car'],
    // learn to duck
    [2.6, 'sign'],
    [2.0, 'car'], [1.3, 'car'],
    // learn who NOT to hit
    [2.4, 'dog'],
    [1.8, 'car'], [1.15, 'phone'], [1.2, 'car'],
    [1.7, 'sign'], [1.4, 'car'], [0.95, 'car'], [0.95, 'phone'],
    // first crowd: a good moment for Road Rage
    [2.2, 'bus'],
    [2.6, 'dog'], [1.3, 'car'], [0.9, 'car'], [1.5, 'sign'], [1.3, 'phone'], [0.9, 'car'], [0.9, 'car'],
    [1.7, 'dog'], [1.2, 'car'], [0.85, 'phone'], [0.85, 'car'], [1.5, 'sign'], [1.2, 'car'],
    [1.7, 'bus'],
    [2.5, 'car'], [0.8, 'car'], [0.8, 'phone'], [1.4, 'sign'], [1.3, 'dog'], [1.2, 'car'], [0.8, 'car'], [0.8, 'car'],
    [1.7, 'bus'],
  ]),
};

/** How many whackable heads a level has (buses carry four). */
export function countHeads(level: LevelDef): number {
  return level.spawns.reduce((n, s) => n + (s.type === 'bus' ? 4 : s.type === 'car' || s.type === 'phone' ? 1 : 0), 0);
}
