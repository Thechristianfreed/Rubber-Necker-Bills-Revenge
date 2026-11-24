import { MiniGame } from '../kit';
import { BopMini } from './BopMini';

/** The sleepover, in a hurry: lights off, and bop. */
export const bop: MiniGame = { id: 'bop', make: (host) => new BopMini(host) };
