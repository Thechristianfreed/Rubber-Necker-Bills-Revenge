/** Level scripts. Each entry is something arriving at Bill: the time is when it
 *  reaches the strike zone, so the rhythm is the same on every screen size. */

export type SpawnType = 'car' | 'phone' | 'bus' | 'dog' | 'sign';

/** How a gawker moves their head: still, leaning back and forth, bobbing up
 *  and down, or both at once. */
export type Move = 'still' | 'lean' | 'bob' | 'both';

export interface Spawn { t: number; type: SpawnType; move: Move }

export interface LevelDef {
  name: string;
  tagline: string;
  /** How far heads lean (sideways) and bob (up and down), in pixels, and how
   *  fast. Later levels turn these up. A bob bigger than the bat's vertical
   *  reach (SWING.reachY) puts the head out of range at the top and bottom. */
  lean: number;
  bob: number;
  restlessness: number;
  spawns: Spawn[];
}

/** Build a timeline from [gap since previous arrival, type, movement] entries. */
function timeline(parts: [number, SpawnType, Move?][]): Spawn[] {
  let t = 0;
  return parts.map(([gap, type, move]) => ({ t: (t += gap), type, move: move ?? 'still' }));
}

export const HIGHWAY_JAM: LevelDef = {
  name: 'HIGHWAY JAM',
  tagline: 'Whack the rubberneckers. Clear the jam!',
  lean: 26,
  bob: 34,
  restlessness: 1,
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
    // now they start leaning back and forth for a better look
    [2.6, 'dog'], [1.3, 'car', 'lean'], [1.0, 'car', 'lean'], [1.5, 'sign'], [1.3, 'phone', 'lean'], [1.0, 'car', 'lean'], [1.0, 'car'],
    // ...and bobbing up and down
    [1.7, 'dog'], [1.3, 'car', 'bob'], [1.0, 'phone', 'bob'], [1.0, 'car', 'lean'], [1.5, 'sign'], [1.3, 'car', 'bob'],
    [1.7, 'bus', 'lean'],
    // the home stretch does both
    [2.5, 'car', 'both'], [1.0, 'car', 'lean'], [1.0, 'phone', 'both'], [1.4, 'sign'], [1.3, 'dog'], [1.3, 'car', 'both'], [1.0, 'car', 'bob'], [1.0, 'car', 'both'],
    [1.8, 'bus', 'bob'],
  ]),
};

/** How many whackable heads a level has (buses carry four). */
export function countHeads(level: LevelDef): number {
  return level.spawns.reduce((n, s) => n + (s.type === 'bus' ? 4 : s.type === 'car' || s.type === 'phone' ? 1 : 0), 0);
}
