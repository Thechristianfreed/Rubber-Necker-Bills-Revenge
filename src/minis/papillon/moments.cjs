// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. `m` is the game, `r` the scene;
// `bot` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
const up = 'm.bubble && m.bubble.scale > 0.98';
module.exports = (bot) => [
  ['01-to-start', "m.course === 0 && said('TO START') && m.t > 0.5"],
  ['02-she-thinks', `m.course === 0 && m.beat === 'think' && ${up} && m.t > 1.9`],
  ['03-she-orders', "m.course === 0 && m.beat === 'order' && said('PLEASE') && m.t > 4.3"],
  ['04-for-you-sir', "m.course === 0 && m.phase === 'pick' && m.cards.length === 4 && m.cards[3].parts[0].y <= 510.2"],
  ['05-bill-orders', "m.course === 0 && m.ordered.length === 1 && said('THE ') && m.bill.look === 'talking' && m.t > 0.4"],
  ['06-coincidence', "m.course === 0 && word('papillon_coincidence')"],
  ['07-the-dome', "m.beat === 'tray' && m.waiter.x > m.post - 4"],
  ['07b-the-reveal', "m.beat === 'reveal' && m.t > 2.2"],
  ['08-compliments', "m.beat === 'compliments' && said('COMPLIMENTS') && m.t > 3.9"],
  ['09-bouche-amused', "m.beat === 'bouche' && said('BOUCHE') && m.christian.box.rotation > 0.06"],
  ['10-rimshot', "m.beat === 'rimshot' && m.bill.look === 'sideeye' && m.t > 6.9"],
  ['11-three-deep', `m.course === 1 && m.beat === 'think' && ${up} && m.t > 1.9`],
  ['12-main-pick', "m.course === 1 && m.phase === 'pick' && m.cards.length === 4 && m.cards[3].parts[0].y <= 510.2"],
  ...(bot ? [
    ['13-what-im-having', "m.beat === 'same' && said('HAVING') && m.t > 1.3"],
    ['14-what-he-should-have', `m.beat === 'again' && ${up}`],
  ] : [
    ['13-dessert-first-thought', `m.course === 2 && m.beat === 'think' && ${up} && m.t < 2.2`],
    ['14-dessert-changed-mind', "m.course === 2 && m.beat === 'think' && m.t > 3.2"],
    ['15-dessert-pick', "m.course === 2 && m.phase === 'pick' && m.cards.length === 4 && m.cards[3].parts[0].y <= 510.2"],
    ['16-bon-appetit', "m.beat === 'finale' && word('papillon_bonappetit')"],
  ]),
];
