// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. `m` is the game, `r` the scene;
// `bot` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
module.exports = (bot) => [
  ['1-start', 'm.taps === 0'],
  ...(bot ? [] : [['2-two-in', 'm.taps === 2']]),
];
