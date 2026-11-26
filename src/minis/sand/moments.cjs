// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name, and
// the condition that says the moment has come (docs/testing.md says what one can use).
// Pocket sand. The careful bot goes straight through (shovel, dominance, a mother's love);
// the clumsy one takes every detour (bucket, the hug, letting Chad handle it).
module.exports = (bot) => [
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
];
