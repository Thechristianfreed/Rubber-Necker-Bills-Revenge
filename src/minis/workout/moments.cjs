// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name, and
// the condition that says the moment has come (docs/testing.md says what one can use).
// Mom's workout tape: one round of it.
module.exports = () => [
  ['1-pose', "m.phase === 'pose' && m.left < 3.3"],
  ['2-breathe', "m.phase === 'breathe' && m.air > 0.7"],
  ['3-pah', "m.phase === 'hold' && m.left < 0.9"],
  ['4-hold', "m.phase === 'hold' && m.left < 0.45"],
];
