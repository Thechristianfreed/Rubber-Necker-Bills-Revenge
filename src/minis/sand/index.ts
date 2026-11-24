import { MiniGame } from '../kit';
import { SandMini } from './SandMini';

/** Pocket sand: the sandbox, three choices, and a mother's love. */
export const sand: MiniGame = { id: 'sand', make: (host) => new SandMini(host) };
