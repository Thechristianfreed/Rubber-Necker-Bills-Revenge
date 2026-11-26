// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. `m` is the game, `r` the scene;
// `bot` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
//
// The careful bot tries the 7 iron and moves the mark on the ball before it swings,
// lets go in the green (NICE SHOT!) and sells enough water for the window. The
// careless one just swings, lets go far too soon (SHANKED), and is too slow on the
// trail: that is the only way to see the losing end.
module.exports = (bot) => [
  ['01-tee', "m.stage === 'tee' && m.phase === 'setup' && said('KEEP YOUR EYE')"],
  ...(bot ? [] : [['02-picked', "m.phase === 'setup' && m.club === 1 && m.aim.x > 0.2"]]),
  ['03-meter', "m.phase === 'meter' && m.holding && m.air > 0.1"],
  ['04-struck', bot ? "word('golf_shanked')" : "word('golf_niceshot')"],
  ['05-incoming', "m.stage === 'yard' && !m.smashed && m.t > 0.25"],
  ['06-window', "m.stage === 'yard' && word('golf_crash')"],
  ['07-my-window', "said('MY WINDOW')"],
  ['08-did-i-win', "m.stage === 'after' && said('DID I WIN')"],
  ['09-next-day', "m.stage === 'card' && m.t > 0.6"],
  ['10-gee-chad', "said('GEE, CHAD')"],
  ['11-gee-shane', "said('GEE, SHANE')"],
  ['12-we-sell-water', "said('WE SELL WATER')"],
  ['13-selling', "m.phase === 'sell' && m.people.length >= 4 && m.fund >= 2"],
  ...(bot
    ? [['14-not-enough', "said('NOT ENOUGH')"]]
    : [['14-thats-a-window', "said('A WINDOW!')"], ['15-store', "m.stage === 'store' && said('ONE WINDOW')"], ['16-paid', "word('golf_paid')"]]),
];
