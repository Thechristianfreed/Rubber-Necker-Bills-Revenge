// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. `m` is the game, `r` the scene;
// `bot` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
//
// They are taken in order, and one that never comes holds up all the ones after it:
// so each is about something that is on the page for a good few frames however fast
// the bot is going (which hand is out, where the glass is), not about how long a
// line has been up.
module.exports = (bot) => (bot ? [
  // the careless one: slow, and telling the same boy twice
  ['1-you-know', "said('YOU KNOW') && m.handFor < 0.8"],
  ['2-running-low', "m.phase === 'play' && m.boys.some((b) => b.low && b.level < 0.14)"],
  ['3-i-knew-it', "m.phase === 'lost' && said('I KNEW IT') && m.endIn < 1.2"],
] : [
  ['0-what-to-do', 'm.tells === 0 && m.t > 0.3'],
  ['1-you-know', "said('YOU KNOW') && m.handFor < 0.8"],
  // the finger to his lips, and then the hand cupped beside his mouth
  ['2-shhhh', "said('SHHHH') && m.hand.visible && m.hand.texture.key === 'favorite_shh' && m.shushFor < 0.3"],
  ['3-really-you', "said('SHHHH') && m.hand.visible && m.hand.texture.key === 'favorite_cup'"],
  ['4-a-drink', 'm.swigging && m.sip > 0.95'],
  ['5-hic', "word('favorite_hic')"],
  ['6-seeing-double', "m.drunk > 0.8 && m.phase === 'play' && m.hand.visible && m.hand.texture.key === 'favorite_point'"],
  ['7-anniversary', "m.phase === 'won' && word('favorite_anniversary')"],
]);
