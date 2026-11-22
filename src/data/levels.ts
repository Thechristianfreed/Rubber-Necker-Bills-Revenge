/** Level scripts. Each entry is something arriving at Bill: the time is when it
 *  reaches the strike zone, so the rhythm is the same on every screen size. */

export type SpawnType =
  | 'car' | 'phone' | 'bus' | 'dog' | 'sign'              // the highway
  | 'mailbox' | 'mailbox2' | 'mailman' | 'branch';        // the street

export type Theme = 'street' | 'highway';

/** How a gawker moves their head: still, leaning back and forth, bobbing up
 *  and down, or both at once. */
export type Move = 'still' | 'lean' | 'bob' | 'both';

export interface Spawn { t: number; type: SpawnType; move: Move }

export interface LevelDef {
  id: string;
  number: number;
  name: string;
  /** When in Bill's life this is. */
  era: string;
  tagline: string;
  theme: Theme;
  /** How fast the world slides past Bill (px/s). */
  speed: number;
  /** How far heads lean (sideways) and bob (up and down), in pixels, and how
   *  fast. Later levels turn these up. A bob bigger than the bat's vertical
   *  reach (SWING.reachY) puts the head out of range at the top and bottom. */
  lean: number;
  bob: number;
  restlessness: number;
  /** What this level calls things. */
  words: { meter: string; counted: string; cleared: string; lost: string };
  spawns: Spawn[];
}

/** Build a timeline from [gap since previous arrival, type, movement] entries. */
function timeline(parts: [number, SpawnType, Move?][]): Spawn[] {
  let t = 0;
  return parts.map(([gap, type, move]) => ({ t: (t += gap), type, move: move ?? 'still' }));
}

/** Level 1: a kid on a Schwinn Stingray with a rolled-up newspaper. */
export const MAILBOX_BASEBALL: LevelDef = {
  id: 'street',
  number: 1,
  name: 'MAILBOX BASEBALL',
  era: 'The sixties',
  tagline: 'Whack every mailbox on the street!',
  theme: 'street',
  speed: 300,
  lean: 0,
  bob: 0,
  restlessness: 1,
  words: { meter: 'MAILBOXES', counted: 'Mailboxes whacked', cleared: 'SPECIAL DELIVERY!', lost: 'TOO MANY LEFT STANDING' },
  spawns: timeline([
    // learn to swing
    [4.5, 'mailbox'], [2.4, 'mailbox'], [2.0, 'mailbox'],
    // learn to duck
    [2.4, 'branch'],
    [1.9, 'mailbox'], [1.3, 'mailbox'],
    // learn who NOT to hit
    [2.3, 'mailman'],
    [1.9, 'mailbox'],
    // two on one swing
    [1.5, 'mailbox2'], [1.7, 'mailbox'],
    [1.6, 'branch'], [1.5, 'mailbox'], [1.0, 'mailbox'], [1.0, 'mailbox'],
    [1.8, 'mailbox2'], [1.5, 'mailbox2'],
    [2.0, 'mailman'], [1.4, 'mailbox'], [0.9, 'mailbox'], [1.5, 'branch'], [1.4, 'mailbox2'], [1.2, 'mailbox'], [0.9, 'mailbox'],
    [1.7, 'mailman'], [1.3, 'mailbox'], [0.85, 'mailbox'], [0.85, 'mailbox'], [1.5, 'branch'], [1.3, 'mailbox2'], [1.2, 'mailbox2'],
    // the home stretch
    [1.7, 'mailbox'], [0.8, 'mailbox'], [0.8, 'mailbox'], [0.8, 'mailbox'],
  ]),
};

/** Level 2: the avocado Bug, the baseball bat, and a highway full of rubberneckers. */
export const HIGHWAY_JAM: LevelDef = {
  id: 'highway',
  number: 2,
  name: 'HIGHWAY JAM',
  era: 'The Bug years',
  tagline: 'Whack the rubberneckers. Clear the jam!',
  theme: 'highway',
  speed: 360,
  lean: 26,
  bob: 34,
  restlessness: 1,
  words: { meter: 'JAM CLEARED', counted: 'Rubberneckers whacked', cleared: 'JAM CLEARED!', lost: 'THE JAM WINS' },
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

export const LEVELS: LevelDef[] = [MAILBOX_BASEBALL, HIGHWAY_JAM];

export function levelById(id: string | null | undefined): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? HIGHWAY_JAM;
}

/** How many things there are to whack in a level. */
export function countHeads(level: LevelDef): number {
  const worth: Partial<Record<SpawnType, number>> = { car: 1, phone: 1, bus: 4, mailbox: 1, mailbox2: 2 };
  return level.spawns.reduce((n, s) => n + (worth[s.type] ?? 0), 0);
}
