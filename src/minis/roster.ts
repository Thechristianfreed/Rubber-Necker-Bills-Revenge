import { MiniGame } from './kit';

/** THE MASTER LIST: every quick game on the Home Movies tape. This is where the
 *  games are stitched into one.
 *
 *  Each game is a folder beside this file (kit.ts says what is in one), and every
 *  folder that has an `index.ts` is on the tape: a new game is added by adding its
 *  folder, and nothing here has to change for it. So two games made at the same
 *  time, in two chats, never meet in this file.
 *
 *  What is decided here is only the order, and that is the owner's to decide. */
const FOLDERS = import.meta.glob('./*/index.ts', { eager: true }) as Record<string, Record<string, unknown>>;

/** The order they come up in. A game that is not named yet (one that has just been
 *  made) goes on after these, in the order of the alphabet... */
const FIRST = ['workout', 'phone', 'bop', 'bat', 'sand'];
/** ...and the tape ends on this. */
const LAST = ['fight'];

const found: MiniGame[] = [];
for (const [path, exported] of Object.entries(FOLDERS)) {
  // (a folder gives one game, called by the folder's name)
  const id = path.split('/')[1], game = exported[id] as MiniGame | undefined;
  if (game && game.id === id) found.push(game);
  else console.error(`src/minis/${id}/index.ts should export a game called "${id}", with that id: it has been left off the tape`);
}

const place = (id: string): number => (FIRST.includes(id) ? FIRST.indexOf(id) : LAST.includes(id) ? 2000 + LAST.indexOf(id) : 1000);
export const ROSTER: MiniGame[] = found.sort((a, b) => place(a.id) - place(b.id) || a.id.localeCompare(b.id));
