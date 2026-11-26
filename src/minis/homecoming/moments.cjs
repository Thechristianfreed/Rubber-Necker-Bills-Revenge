// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name, and
// the condition that says the moment has come. `m` is the game, `r` the scene; `bot`
// is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
// Pappy comes home. Both bots get in and both are forgiven: the careless one goes
// back to a key he has tried, and stops half way across the carpet for a think.
module.exports = (bot) => [
  ['01-fumble', "m.phase === 'keys' && m.tries === 0 && !m.picking && said('WHICH ONE') && m.t > 0.9"],
  ['02-choose', "m.picking && m.tries === 0 && m.botIn < 0.2"],
  ['04-try', "!m.picking && m.tries === 1 && m.hand.y < m.lock.y + 3 && Math.abs(m.hand.rotation - m.handRest) > 0.05"],
  ['05-nope', "m.tries === 1 && said('HUH') && m.sag > 0.9"],
  ...(bot ? [['05-not-again', "m.picking && m.tries === 1 && m.botAt === 2 && m.botIn < 0.62"]] : []),
  ['06-one-left', "m.picking && m.tries === 2 && m.botIn < 0.2"],
  ['07-click', "m.tries === 3 && said('THERE WE GO')"],
  ['08-ajar', "m.phase === 'door' && m.eyes && m.eyes.active && m.eyes.alpha > 0.95 && m.ajar < 0.88"],
  ['09-bang', "m.phase === 'door' && m.wife.visible && m.ajar < 0.06 && m.wife.scale > 1.008"],
  ['10-hi-honey', "said('HI, HONEY') && m.sag > 1.3"],
  ['11-where', "said('WHERE HAVE YOU BEEN') && m.wife.scale > 1.44 && m.said[0].left < 0.6 && keyOf(m.wifeFace).includes('yell')"],
  ['12-time', "said('WHAT TIME') && m.said[0].left < 0.6 && keyOf(m.wifeFace).includes('yell')"],
  ['13-room', "m.phase === 'room' && said('DINNER') && m.said[0].left < 0.9"],
  ['14-idea', "m.phase === 'room' && m.pappy.look === 'smug' && said('ANOTHER THING') && m.said[0].left < 0.7"],
  ['15-yes-dear', "said('YES, DEAR') && m.said[0].left < 0.8"],
  ['16-knees', "m.phase === 'room' && m.pappy.pose === 'kneel' && m.mammy.pose === 'stand' && m.bits.length && m.bits[0].life < 0.3"],
  ['17-round', "m.phase === 'room' && m.mammy.pose === 'bent' && Math.abs(m.mammy.box.scaleX - 1.25) < 0.01"],
  ...(bot ? [['18-a-think', "m.phase === 'kiss' && m.kisses === 0 && m.botWait > 0 && m.botWait < 0.4"]] : [['18-sliding', "m.phase === 'kiss' && m.kisses === 0 && m.vx > 300 && m.pappyX > m.lipsAt - 120"]]),
  ['19-kiss', "m.kisses === 1 && m.pappy.pose === 'smooch' && m.cool < 0.44"],
  ['20-shoved', "m.kisses === 1 && m.pappy.look === 'ouch' && m.stun < 0.2"],
  ['21-kiss-4', "m.kisses === 4 && m.pappy.pose === 'smooch' && m.cool < 0.44"],
  ['22-kiss-7', "m.kisses === 7 && m.pappy.pose === 'smooch' && m.cool < 0.44"],
  ['23-enough', "m.phase === 'won' && m.kisses === 8 && m.pappy.pose === 'smooch' && m.t > 0.4"],
  ['24-forgiven', "m.phase === 'won' && said('FORGIVEN') && m.bits.length > 4"],
  ['25-youdidit', "word('youdidit')"],
];
