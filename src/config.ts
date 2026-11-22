/** Shared layout + tuning numbers. All positions are in "design pixels": the
 *  playfield is always 540 tall and between MIN_W and MAX_W wide. */

export const H = 540;
export const MIN_W = 880;
export const MAX_W = 1240;

/** Art is drawn at this multiple of design pixels so it stays crisp on phones. */
export const TEX = 2;

export const INK = '#231d1b';
export const PAPER = '#fffaf0';

/** Runtime view info, set in main.ts and updated when the window changes. */
export const view = { W: 960, RES: 1 };

export const LANE = {
  /** Wheel line of the jammed (rubbernecker) lane. */
  farBase: 258,
  /** Height where gawking heads dangle - the strike zone. */
  headY: 276,
  medianY: 312,
  /** Wheel line of Bill's lane. */
  billBase: 506,
};

export const SPEED = {
  /** How fast the world slides past Bill (px/s). */
  world: 360,
  /** Extra closing speed from the rubberneckers crawling the other way. */
  crawl: 46,
};

export const BILL = {
  /** Bill's car sits this fraction of the way across the screen. */
  xFrac: 0.29,
  /** Sweet spot of the swing, relative to Bill's x. */
  sweetDX: 70,
  duckDepth: 58,
  maxHearts: 3,
};

export const SWING = {
  /** Seconds from tap to the bat reaching the strike zone. */
  windup: 0.055,
  /** How long the bat stays "live". */
  active: 0.13,
  /** Lock-out after a swing that connects / whiffs. */
  recoverHit: 0.16,
  recoverMiss: 0.34,
  /** Half-widths of the timing windows, in px from the sweet spot. */
  good: 56,
  perfect: 18,
};

export const SCORE = {
  good: 10,
  perfect: 25,
  dodge: 5,
  dogFine: 50,
  rageGood: 9,
  ragePerfect: 15,
  passStars: [0.6, 0.8, 0.95],
};

export const DEPTH = {
  sky: 0, far: 5, road: 10, farCars: 20, necks: 30, heads: 32, median: 36,
  billBack: 40, billCar: 44, fx: 60, fore: 70, hud: 100, overlay: 200,
};
