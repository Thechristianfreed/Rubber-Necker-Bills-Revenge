// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name, and
// the condition that says the moment has come (docs/testing.md says what one can use).
// After school: the fight, which cannot be won.
module.exports = () => [
  ['1-callout', "m.phase === 'callout' && m.t > 3.3"],
  ['2-shove', "m.phase === 'callout' && m.knock > 0.9 && m.t > 4.62"],
  ['3-stand', "m.phase === 'callout' && m.t > 6.2"],
  ['4-mercy', "m.phase === 'power' && m.t > 4.0 && m.bubbles.length > 1"],
  ['5-super', "m.phase === 'super' && m.t > 0.75"],
  ['6-swing-up', "m.phase === 'smash' && m.slams >= 1 && m.swinging && m.swing > 0.2 && m.swing < 0.34"],
  ['7-slam', "m.phase === 'smash' && !m.swinging && m.slams >= 2"],
  ['8-flawless', "m.phase === 'ko' && m.t > 3.7"],
  ['9-fatality', "m.phase === 'ko' && m.t > 5.7"],
];
