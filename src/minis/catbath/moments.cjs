// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name, and
// the condition that says the moment has come. `m` is the game, `r` the scene; `bot`
// is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
// Bath time. Both bots get every cat clean; the careless one is slower at all of it,
// so the cats get their claws into Pappy more often.
module.exports = (bot) => [
  ['01-stink', "m.beat === 'stink' && m.t > 1.2"],
  ['02-someone', "said('SOMEONE NEEDS') && m.said[0].left < 1.5"],
  ['03-hiss', "m.beat === 'hiss' && word('catbath_hiss')"],
  ['04-kitchen', "m.stage === 'sink' && m.beat === 'kitchen' && m.t > 1.0"],
  ['05-why-you', "said('WHY YOU LITTLE') && m.said[0].left < 0.7"],
  ['06-choke', "m.step === 'choke' && m.n === 0 && m.fight < 0.6"],
  ['07-claws', "m.step === 'choke' && m.scratches.length > 0"],
  ['08-out-cold', "m.beat === 'out0'"],
  ['09-sploosh', "m.beat === 'dunk0' && m.bits.length > 20"],
  ['10-scrub', "m.step === 'scrub' && m.n === 0 && m.strokes >= 3"],
  ['11-rinse', "m.beat === 'rinse0' && m.bits.length > 10"],
  ['12-wring', "m.step === 'wring' && m.n === 0 && m.quarters >= 5"],
  ['13-hang', "m.beat === 'wrung0'"],
  ['14-kiss', "m.beat === 'kiss0' && m.bits.some((b) => b.im.texture.key === 'heart')"],
  ['15-second', "m.step === 'choke' && m.n === 1 && m.fight < 0.7"],
  ['16-third-wring', "m.step === 'wring' && m.n === 2 && m.quarters >= 3"],
  ['17-drying', "m.beat === 'drying' && m.cats.filter((c) => c.im.texture.key.endsWith('_dry')).length === 2"],
  ['18-all-clean', "m.beat === 'clean' && m.bits.length > 20"],
];
