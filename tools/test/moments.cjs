// The moments of each quick game worth a picture, for mini_show.cjs: a name, and
// the condition that says it has come (see snapper() in lib.cjs for what a
// condition can use). Each is given the bot that is playing: '' or 'clumsy'.
// A new game gets a list here.
module.exports = {
  // Mom's workout tape: one round of it
  workout: () => [
    ['1-pose', "m.phase === 'pose' && m.left < 3.3"],
    ['2-breathe', "m.phase === 'breathe' && m.air > 0.7"],
    ['3-pah', "m.phase === 'hold' && m.left < 0.9"],
    ['4-hold', "m.phase === 'hold' && m.left < 0.45"],
  ],

  // Payback: the week of it, the snap, the chase, and the back door
  bat: (bot) => [
    ['1-week', "m.phase === 'week' && m.knock > 0.9 && m.t > 1.5"],
    ['2-snap', "m.phase === 'snap' && m.t > 1.15"],
    ['3-reach', "m.phase === 'chase' && m.alert.visible && m.seen > 0.05"],
    ['4-bonk', "m.phase === 'chase' && m.hits >= 1 && m.hop > 0.3 && m.hop < 0.7"],
    ...(bot ? [['5-whiff', "m.phase === 'chase' && m.busy > 0.5 && m.chad.pose === 'swing'"]] : []),
    ['6-home', "m.phase === 'home' && m.t > 2.4"],
  ],

  // Pocket sand. The careful bot goes straight through (shovel, dominance, a mother's
  // love); the clumsy one takes every detour (bucket, the hug, letting Chad handle it).
  sand: (bot) => [
    ...(bot ? [
      ['01-bucket', "m.chad.pose === 'bucket' && m.castle && m.t > 1.3"],
      ['02-nice', "said('NICE CASTLE')"],
      ['03-shove', "m.chad.pose === 'shoved' && m.knock > 0.9 && m.toy"],
      ['04-reach', "m.round === 1 && m.shane.pose === 'reach' && m.shaneX < m.chadX + 100"],
      ['05-hug', "m.pair && m.pair.list[0].texture.key === 'pair_hug' && m.t > 1.4"],
      ['06-side', "said('I LOVE YOU') && m.said[0].left < 2.0"],
      ['07-jarring', "!m.pair && m.round === 1 && m.shane.pose === 'throw' && m.lean > 0.5"],
      ['08-cry', "m.chad.pose === 'wail' && said('WAAAH')"],
      ['09-third', "said('HOW WOULD YOU') && m.said[0].left < 1.7"],
      ['10-set', "m.shot.some((o) => o.name === 'face' && o.texture.key.includes('set')) && m.t > 1.2"],
      ['11-yell', "m.shot.some((o) => o.type === 'Text') && m.t > 2.0"],
      ['12-stance', "!m.shot.length && m.tried && m.chad.pose === 'stance'"],
      ['13-punch', "m.tried && m.phase === 'play' && m.knock > 0.9"],
      ['14-crossed', "m.phase === 'pick' && m.round === 2 && m.tried && m.botIn < 0.5"],
    ] : [
      ['01-dig', "m.chad.pose === 'dig' && m.t > 1.0"],
      ['02-gimme', "said('GIMME')"],
      ['03-shove', "m.chad.pose === 'shoved' && m.knock > 0.9 && m.toy"],
      ['04-throw', "m.shane.pose === 'throw' && m.lean > 0.5"],
      ['05-mom', "said('KNOCK IT OFF') && m.said[0].left < 1.0"],
      ['06-mysandbox', "said('MY SANDBOX')"],
      ['07-cry', "m.chad.pose === 'wail' && said('WAAAH')"],
      ['08-mom2', "said('STOP PUSHING') && m.said[0].left < 1.4"],
      ['09-third', "said('HOW WOULD YOU') && m.said[0].left < 1.7"],
      ['10-pick-mom', "m.phase === 'pick' && m.round === 2 && !m.tried && m.botIn < 0.25"],
    ]),
    ['a1-pan', "inShot('mom_below') && inShot('mom_below').y < 60"],
    ['a2-blah', "said('BLAH BLAH. BLAH!')"],
    ['a3-blah', "said('BLAH BLAH BLAH BLAH!')"],
    ['b1-far', "inShot('shane_above') && inShot('shane_above').scale < 0.52 && !inShot('hand_throw')"],
    ['b2-doe', "m.shot.filter((o) => keyOf(o) === 'sparkle').length >= 6 && m.shot.some((o) => keyOf(o) === 'sparkle' && o.scale > 0.3)"],
    ['c1-hand', "piece('hand_grab') && piece('hand_grab').y > 320"],
    ['c2-away', "piece('hand_grab') && piece('sand_pile').scale < 0.4 && piece('hand_grab').y < 120"],
    ['d0-before', "piece('hand_throw') && piece('shane_above')"],
    ['d1-pocketsand', "!!m.shotTears && piece('hand_throw').y < 520 && !m.shot.some((o) => o.type === 'Rectangle' && o.fillColor === 0xffffff && o.alpha > 0.15)"],
    ['d2-pocketsand', "!!m.shotTears && piece('hand_throw').y > 430 && m.bits.length > 20"],
    ['e-youdidit', "!m.shot.length && word('youdidit')"],
  ],

  // After school: the fight, which cannot be won
  fight: () => [
    ['1-callout', "m.phase === 'callout' && m.t > 3.3"],
    ['2-shove', "m.phase === 'callout' && m.knock > 0.9 && m.t > 4.62"],
    ['3-stand', "m.phase === 'callout' && m.t > 6.2"],
    ['4-mercy', "m.phase === 'power' && m.t > 4.0 && m.bubbles.length > 1"],
    ['5-super', "m.phase === 'super' && m.t > 0.75"],
    ['6-swing-up', "m.phase === 'smash' && m.slams >= 1 && m.swinging && m.swing > 0.2 && m.swing < 0.34"],
    ['7-slam', "m.phase === 'smash' && !m.swinging && m.slams >= 2"],
    ['8-flawless', "m.phase === 'ko' && m.t > 3.7"],
    ['9-fatality', "m.phase === 'ko' && m.t > 5.7"],
  ],
};
