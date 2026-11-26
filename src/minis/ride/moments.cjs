// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name, and
// the condition that says the moment has come. `m` is the game, `r` the scene; `bot`
// is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
// Take 'em for a ride. The careful bot misses everything in the road and kicks each
// one out first time; the careless one hits some of the road and whiffs every first kick.
module.exports = (bot) => [
  ['01-keep-em', "said('KEEP') && m.said[0].left < 1.1"],
  ['02-of-course', "said('OF COURSE') && m.said[0].left < 0.8"],
  ['03-leave-them', "said('STEPHANIE! LEAVE') && m.said[0].left < 1.0"],
  ['04-quack', "m.beat === 'ducks' && word('ride_quack')"],
  ['05-bed', "said('OFF TO BED') && m.said[0].left < 0.9"],
  ['06-night-night', "said('NIGHT NIGHT') && m.said[0].left < 0.7"],
  ['07-stare', "m.beat === 'stare' && m.cues.length && m.cues[0].at - m.t < 0.8"],
  ['08-you-know', "said('YOU KNOW WHAT') && m.said[0].left < 1.0"],
  ['09-drive', "m.stage === 'drive' && m.clock > 2.4"],
  [bot ? '10-bump' : '10-dodge', bot ? "m.stage === 'drive' && m.bumps >= 1 && r.children.list.some((o) => o.texture && (o.texture.key === 'word_crash' || o.texture.key === 'word_bonk') && o.alpha >= 1)" : "m.stage === 'drive' && m.clock > 8.2"],
  ['11-forest', "m.stage === 'drive' && m.clock > 17.2"],
  ['12-edge', "m.stage === 'drive' && !!m.caption && m.caption.text.includes('EDGE OF TOWN.')"],
  ['13-door', "m.stage === 'kick' && m.beat === 'door' && m.t > 1.6"],
  // (the careless one lets go far too soon the first time: catch it holding before it does)
  ['14-meter', `m.stage === 'kick' && m.holding && m.air > ${bot ? 0.04 : 0.12}`],
  ...(bot ? [['15-whiff', "m.beat === 'whiff' && m.kicked === 0 && m.pappy.pose === 'pappy_kick'"]] : []),
  ['16-boot', "m.beat === 'boot' && m.kicked === 1 && m.pappy.pose === 'pappy_kick'"],
  ['17-dont-come-back', "said('FIDO! AND') && m.said[0].left < 1.0"],
  ['18-duck', "m.beat === 'boot' && m.kicked === 5 && said('MR. QUACKS')"],
  ['19-where', "said('WHERE DID FIDO') && m.said[0].left < 1.1"],
  ['20-ran-away', "said('RAN AWAY') && m.said[0].left < 1.2"],
  ['21-cry', "m.beat === 'cry' && m.bits.length > 6"],
  ['22-pop', "m.beat === 'pop' && m.bits.length > 14 && word('ride_pop')"],
  ['23-haha', "said('HA HA') && m.said[0].left < 1.2"],
];
