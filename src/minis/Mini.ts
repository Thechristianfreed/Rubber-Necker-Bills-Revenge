import Phaser from 'phaser';

export type Point = { x: number; y: number };

/** What a quick game can ask of the scene that is running it. */
export interface MiniHost {
  readonly scene: Phaser.Scene;
  /** How much faster than normal things are running: 1 the first time round. */
  readonly speed: number;
  /** Who is playing: a person, or one of the self-play bots. */
  readonly auto: '' | 'good' | 'clumsy';
  /** End the game now, won or lost, without waiting for the clock. */
  finish(won: boolean): void;
  /** Pop a word on a paper burst (any `word_*` art). */
  word(word: string, x: number, y: number, big?: boolean): void;
}

/** One quick game. The scene builds it, shows what to do, runs it against the
 *  clock, and clears everything it made away afterwards, so a game can simply
 *  add what it needs to the scene and forget about it.
 *
 *  To add a game: make a class like the ones beside this file, and put it in
 *  the list in MiniScene.ts. */
export abstract class Mini {
  /** What it is called, on the tape label. */
  abstract readonly title: string;
  /** What to do, in a few words: shown large before it starts. */
  abstract readonly prompt: string;
  /** How long it lasts at normal speed, in seconds. */
  abstract readonly seconds: number;
  /** Music of its own (a file in public/music), if it has any. */
  readonly music?: string;

  constructor(protected readonly host: MiniHost) {}

  protected get scene(): Phaser.Scene {
    return this.host.scene;
  }

  /** Put everything on the page. Nothing moves until the clock starts. */
  abstract build(): void;

  /** Once a frame while it is being played; `dt` already allows for the speed. */
  update(_dt: number): void {}

  /** A finger down, and up again. */
  press(_at: Point): void {}
  release(_at: Point): void {}

  /** The clock has run out: was that good enough? */
  abstract timeUp(): boolean;

  /** Self-play, for testing: called once a frame when a bot is at the controls. */
  bot(_dt: number): void {}
}
