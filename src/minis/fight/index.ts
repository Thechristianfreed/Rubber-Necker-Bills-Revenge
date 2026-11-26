import { MiniGame } from '../kit';
import { FightMini } from './FightMini';

/** After school: the fight Stephanie cannot win. */
export const fight: MiniGame = { id: 'fight', make: (host) => new FightMini(host) };
