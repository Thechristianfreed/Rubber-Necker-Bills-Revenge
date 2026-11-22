/** Where each recorded line is in voice/lines.mp3: [start, length] in seconds.
 *  Written by tools/make_voice.py from the family's recording; do not edit by hand. */
export const VOICE = {
  damn_phone: [0.300, 1.900],          // Get off your DAMN PHONE!
  addicted: [2.500, 1.130],            // You're ADDICTED!
  piss_rope: [3.930, 2.770],           // OH PISS UP A ROPE!
  keep_moving: [7.000, 1.040],         // Keep it moving!
  nothing_to_see: [8.340, 1.420],      // Nothing to see here!
  eyes_road: [10.060, 1.560],           // Eyes on the road!
  fender_bender: [11.920, 1.580],       // It's a fender bender!
  sorry_pooch: [13.800, 0.660],         // Sorry, pooch!
  sorry_mister: [14.760, 1.020],        // Sorry, mister!
  special_delivery: [16.080, 1.420],    // Special delivery!
  extra_extra: [17.800, 1.470],         // Extra! Extra!
  read_all: [19.570, 1.420],            // Read all about it!
  fifteen_love: [21.290, 1.320],        // Fifteen-love!
  return_sender: [22.910, 1.420],       // Return to sender!
  not_peanut_butter: [24.630, 1.850],   // That's not peanut butter!
  game_set_match: [26.780, 1.990],      // Game, set, match!
  teacher_book: [29.070, 1.650],        // The teacher: WHERE is your BOOK?!
  bully_milkshake: [31.020, 4.070],     // The bully: Someone broke into my locker...
  fx_bonk: [35.390, 0.479],             // BONK!
  fx_boing: [36.169, 1.302],            // boi-oi-oi-oing
  fx_whoosh: [37.771, 0.450],           // whoosh
  fx_splat: [38.521, 0.303],            // SPLAT!
  fx_ow: [39.124, 0.690],               // OW!
  fx_yelp: [40.114, 0.491],             // a dog yelp
  fx_woohoo: [40.905, 0.872],           // WOO-HOO!
  fx_groan: [42.077, 1.079],            // a long groan
} as const;

export type VoiceId = keyof typeof VOICE;
