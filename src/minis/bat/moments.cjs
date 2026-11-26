// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name, and
// the condition that says the moment has come (docs/testing.md says what one can use).
// Payback: the week of it, the snap, the chase, and the back door.
module.exports = (bot) => [
  ['1-week', "m.phase === 'week' && m.knock > 0.9 && m.t > 1.5"],
  ['2-snap', "m.phase === 'snap' && m.t > 1.15"],
  ['3-reach', "m.phase === 'chase' && m.alert.visible && m.seen > 0.05"],
  ['4-bonk', "m.phase === 'chase' && m.hits >= 1 && m.hop > 0.3 && m.hop < 0.7"],
  ...(bot ? [['5-whiff', "m.phase === 'chase' && m.busy > 0.5 && m.chad.pose === 'swing'"]] : []),
  ['6-home', "m.phase === 'home' && m.t > 2.4"],
];
