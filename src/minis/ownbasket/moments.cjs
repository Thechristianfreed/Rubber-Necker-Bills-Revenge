// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. `m` is the game, `r` the scene;
// `bot` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
// Stephanie's only basket. The careful bot takes each of the four shots in turn (in the
// green, early, far too early, far too late) and steals the ball back every other time;
// the clumsy one never shoots, and loses.
module.exports = (bot) => (bot ? [
  ['01-tip', "m.phase === 'open' && m.t > 0.5"],
  ['02-dither', "m.phase === 'mine' && m.held > 6.2"],
  ['03-stolen', "m.phase === 'loose' && m.look === 'shocked'"],
  ['04-whiff', "m.pose === 'steal' && m.lunge > 12 && m.look === 'guilty'"],
  ['05-her-basket', "m.phase === 'loose' && m.herPose === 'cheer' && m.hop > 12"],
  ['06-final', "m.phase === 'final' && m.t > 1.6"],
] : [
  ['01-tip', "m.phase === 'open' && m.t > 0.5"],
  ['02-off-the-rim', "m.phase === 'hershot' && m.bounced === 1 && m.leg && m.leg.k > 0.4"],
  ['03-rebound', "m.phase === 'mine' && m.baskets === 0 && m.held > 0.25"],
  ['04-filling', "m.phase === 'aim' && m.shots === 0 && m.air > 0.84"],
  ['05-backwards', "m.phase === 'shot' && m.kind === 'sweet' && m.leg && m.leg.k > 0.45"],
  ['06-swish', "m.phase === 'scored' && m.baskets === 1 && m.t > 0.28"],
  ['07-wrong-basket', "m.phase === 'scored' && m.baskets === 1 && m.t > 0.75"],
  ['08-her-answer', "said('OWN BASKET')"],
  ['09-steal', "m.pose === 'steal' && m.lunge > 12 && m.look !== 'guilty'"],
  ['10-early', "m.phase === 'shot' && m.kind === 'rim' && m.bounced === 0 && m.leg && m.leg.k > 0.6"],
  ['11-off-their-rim', "m.phase === 'shot' && m.kind === 'rim' && m.bounced === 1 && m.leg && m.leg.k > 0.45"],
  ['12-her-shot', "m.phase === 'hers' && m.windup > 0 && m.windup < 0.2"],
  ['13-too-early', "m.phase === 'shot' && m.kind === 'floor' && m.bounced === 1 && m.leg && m.leg.k > 0.12 && m.leg.k < 0.3"],
  ['14-too-late', "m.phase === 'aim' && m.air > 1.25"],
  ['15-scoreboard', "m.phase === 'shot' && m.kind === 'long' && m.bounced === 1 && m.leg && m.leg.k > 0.15"],
  ['16-final', "m.phase === 'final' && m.t > 1.6"],
]);
