import type { VoiceId } from './voice';

/** Things Bill says. `real: true` lines are actual Bill-isms supplied by the
 *  family; the rest are placeholders until we collect more of the real ones. */

/** `voice` is the recording of the line (see data/voice.ts), if there is one. */
export interface Phrase { text: string; real?: boolean; voice?: VoiceId }

export const PHRASES = {
  /** When he whacks somebody filming on their phone. */
  phone: [
    { text: 'Get off your DAMN PHONE!', real: true, voice: 'damn_phone' },
    { text: "You're ADDICTED!", real: true, voice: 'addicted' },
  ] as Phrase[],
  /** When something hits Bill, or it all goes wrong. */
  hurt: [
    { text: 'OH PISS UP A ROPE!', real: true, voice: 'piss_rope' },
  ] as Phrase[],
  /** Road Rage special. */
  rage: [
    { text: 'OH PISS UP A ROPE!', real: true, voice: 'piss_rope' },
    { text: 'KEEP IT MOVING!', voice: 'keep_moving' },
    { text: 'NOTHING TO SEE HERE!', voice: 'nothing_to_see' },
  ] as Phrase[],
  /** Occasional lines on a good combo. */
  combo: [
    { text: 'EYES ON THE ROAD!', voice: 'eyes_road' },
    { text: 'KEEP IT MOVING!', voice: 'keep_moving' },
    { text: "It's a FENDER BENDER!", voice: 'fender_bender' },
  ] as Phrase[],
  dog: [
    { text: 'Sorry, pooch!', voice: 'sorry_pooch' },
  ] as Phrase[],
  /** Level 1, the street. */
  mailman: [
    { text: 'Sorry, mister!', voice: 'sorry_mister' },
  ] as Phrase[],
  comboStreet: [
    { text: 'SPECIAL DELIVERY!', voice: 'special_delivery' },
    { text: 'EXTRA! EXTRA!', voice: 'extra_extra' },
    { text: 'READ ALL ABOUT IT!', voice: 'read_all' },
  ] as Phrase[],
  /** The bonus level, in the school hallway. */
  comboLocker: [
    { text: 'FIFTEEN-LOVE!', voice: 'fifteen_love' },
    { text: 'RETURN TO SENDER!', voice: 'return_sender' },
    { text: "THAT'S NOT PEANUT BUTTER!", voice: 'not_peanut_butter' },
  ] as Phrase[],
  rageLocker: [
    { text: 'OH PISS UP A ROPE!', real: true, voice: 'piss_rope' },
    { text: 'GAME, SET, MATCH!', voice: 'game_set_match' },
  ] as Phrase[],
  rageStreet: [
    { text: 'OH PISS UP A ROPE!', real: true, voice: 'piss_rope' },
    { text: 'READ ALL ABOUT IT!', voice: 'read_all' },
  ] as Phrase[],
};

export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
