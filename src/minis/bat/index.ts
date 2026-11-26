import { MiniGame } from '../kit';
import { BatMini } from './BatMini';

/** Payback: the day Chad had had enough, and the baseball bat. */
export const bat: MiniGame = { id: 'bat', make: (host) => new BatMini(host) };
