import { MiniGame } from '../kit';
import { PhoneMini } from './PhoneMini';

/** The bus of people filming: bonk every phone. */
export const phone: MiniGame = { id: 'phone', make: (host) => new PhoneMini(host) };
