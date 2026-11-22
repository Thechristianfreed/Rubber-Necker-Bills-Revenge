/** Things Bill says. `real: true` lines are actual Bill-isms supplied by the
 *  family; the rest are placeholders until we collect more of the real ones. */

export interface Phrase { text: string; real?: boolean }

export const PHRASES = {
  /** When he whacks somebody filming on their phone. */
  phone: [
    { text: 'Get off your DAMN PHONE!', real: true },
    { text: "You're ADDICTED!", real: true },
  ] as Phrase[],
  /** When something hits Bill, or it all goes wrong. */
  hurt: [
    { text: 'OH PISS UP A ROPE!', real: true },
  ] as Phrase[],
  /** Road Rage special. */
  rage: [
    { text: 'OH PISS UP A ROPE!', real: true },
    { text: 'KEEP IT MOVING!' },
    { text: 'NOTHING TO SEE HERE!' },
  ] as Phrase[],
  /** Occasional lines on a good combo. */
  combo: [
    { text: 'EYES ON THE ROAD!' },
    { text: 'KEEP IT MOVING!' },
    { text: "It's a FENDER BENDER!" },
  ] as Phrase[],
  dog: [
    { text: 'Sorry, pooch!' },
  ] as Phrase[],
  /** Level 1, the street. */
  mailman: [
    { text: 'Sorry, mister!' },
  ] as Phrase[],
  comboStreet: [
    { text: 'SPECIAL DELIVERY!' },
    { text: 'EXTRA! EXTRA!' },
    { text: 'READ ALL ABOUT IT!' },
  ] as Phrase[],
  rageStreet: [
    { text: 'OH PISS UP A ROPE!', real: true },
    { text: 'READ ALL ABOUT IT!' },
  ] as Phrase[],
};

export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
