import { MiniGame } from '../kit';
import { WorkoutMini } from './WorkoutMini';

/** Mom's workout tape: strike the pose, breathe in, and PAH. */
export const workout: MiniGame = { id: 'workout', make: (host) => new WorkoutMini(host) };
