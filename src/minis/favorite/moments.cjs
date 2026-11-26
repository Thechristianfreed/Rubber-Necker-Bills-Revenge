// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. `m` is the game, `r` the scene;
// `bot` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
module.exports = (bot) => (bot ? [
  // the careless one: slow, and telling the same boy twice
  ['1-you-know', "said('YOU KNOW')"],
  ['2-running-low', "m.phase === 'play' && m.boys.some((b) => b.low && b.level < 0.14)"],
  ['3-i-knew-it', "m.phase === 'lost' && said('I KNEW IT') && m.endIn < 1.2"],
] : [
  ['1-you-know', "said('YOU KNOW') && m.handFor < 0.75"],
  ['2-shhhh', "said('SHHHH') && m.shushFor > 0.1 && m.shushFor < 0.35"],
  ['3-really-you', "m.t > 3 && said('SHHHH') && m.shushFor <= 0 && m.handFor < 0.8"],
  ['4-a-drink', 'm.swigging && m.sip > 0.95'],
  ['5-hic', "word('favorite_hic')"],
  ['6-seeing-double', "m.drunk > 0.8 && m.phase === 'play' && said('FAVORITE') && m.handFor > 0.5"],
  ['7-anniversary', "m.phase === 'won' && word('favorite_anniversary')"],
]);
