// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. `m` is the game, `r` the scene;
// `bot` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
module.exports = (bot) => (bot ? [
  // the careless one: pokes too soon, misses the first chance, shoves slowly, and runs out of time
  ['1-too-soon', "m.early === 1 && m.thrust > 0.85"],
  ['2-too-slow', "m.missed === 1 && m.phase === 'pinch' && m.t < -0.2"],
  ['3-slow-shoving', "m.phase === 'cram' && m.count === 0 && m.p > 0.5"],
  ['4-waiter-coming', "m.waiterOn && m.clock > m.seconds - 2.5 && m.phase !== 'lost'"],
  ['5-ptooey', "m.phase === 'lost' && m.t > 0.1 && m.t < 0.3"],
  ['6-noodles', "m.phase === 'lost' && m.t > 1.3"],
] : [
  // the careful one: three vegetables, each bigger than the last
  ['1-shut-tight', "m.phase === 'pinch' && m.count === 0 && m.t > 0.7"],
  ['2-gasp', "m.phase === 'gasp' && m.count === 0 && m.t > 0.06"],
  ['3-carrot', "m.phase === 'cram' && m.count === 0 && m.p > 0.35"],
  ['4-gulp', "m.phase === 'gulp' && m.count === 1 && m.rise > 0.9 && m.t > 0.3"],
  ['5-corn', "m.phase === 'cram' && m.count === 1 && m.p > 0.3"],
  ['6-broccoli-in', "m.phase === 'cram' && m.count === 2 && m.shoves === 1"],
  ['7-broccoli-down', "m.phase === 'cram' && m.count === 2 && m.p > 0.7"],
  ['8-clean-plate', "m.phase === 'won' && m.t > 0.35 && m.t < 0.55"],
  ['9-burp', "m.phase === 'won' && m.t > 0.7"],
]);
