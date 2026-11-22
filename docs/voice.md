# Voices, mouth sounds and sound effects

Bill's lines, the two voices on the SKIPPY Jar's story page, and eight mouth
sounds come from one family recording, `audio-src/voice/Record1.wav`: every
item read once, in order, with a pause between them.

`tools/make_voice.py` cuts it up. Its `CUTS` list says where each item is in
the recording; each clip is trimmed to where the sound starts and stops,
levelled so quiet ones match shouted ones, and joined into one file,
`public/voice/lines.mp3`. It also writes `src/data/voice.ts`, which tells the
game where each clip is in that file.

| Clip | What is said | Where the game uses it |
| --- | --- | --- |
| `damn_phone` | "Get off your DAMN PHONE!" | whacking a phone filmer |
| `addicted` | "You're ADDICTED!" | whacking a phone filmer |
| `piss_rope` | "OH PISS UP A ROPE!" | Bill gets hit; the RAGE special |
| `keep_moving` | "Keep it moving!" | Highway Jam combos and special |
| `nothing_to_see` | "Nothing to see here!" | Highway Jam special |
| `eyes_road` | "Eyes on the road!" | Highway Jam combos |
| `fender_bender` | "It's a fender bender!" | Highway Jam combos |
| `sorry_pooch` | "Sorry, pooch!" | hitting the dog |
| `sorry_mister` | "Sorry, mister!" | hitting the mailman |
| `special_delivery` | "Special delivery!" | Paper Route combos |
| `extra_extra` | "Extra! Extra!" | Paper Route combos |
| `read_all` | "Read all about it!" | Paper Route combos and special |
| `fifteen_love` | "Fifteen-love!" | SKIPPY Jar combos |
| `return_sender` | "Return to sender!" | SKIPPY Jar combos |
| `not_peanut_butter` | "That's not peanut butter!" | SKIPPY Jar combos |
| `game_set_match` | "Game, set, match!" | SKIPPY Jar special |
| `teacher_book` | "WHERE is your BOOK?!" | story page, the teacher |
| `bully_milkshake` | "Ugh... Someone broke into my locker..." | story page, the bully |
| `fx_bonk` | "BONK!" | about one hit in eight (the rest are library sounds) |
| `fx_boing` | "boi-oi-oi-oing" | about one neck stretch in nine |
| `fx_whoosh` | "whoosh" | every swing |
| `fx_splat` | "SPLAT!" | something landing on the lockers |
| `fx_ow` | "OW!" | Bill gets hit (and, higher, the mailman) |
| `fx_yelp` | a dog yelp | hitting the dog |
| `fx_woohoo` | "WOO-HOO!" | winning a level |
| `fx_groan` | a groan | losing a level |

The mouth sounds are played a little faster or slower each time so they do
not sound identical, and the music dips while a line is being spoken. Effects
nobody has recorded (the sign's clang, the cash register, the special) are
still synthesised in `src/audio/sound.ts`.

## Library sound effects

So that the same sound is not heard on every hit, most hits and neck
stretches use recordings from a free library, several of each, picked at
random and never the same one twice running:

| Group | What is in it | Where the game uses it |
| --- | --- | --- |
| `hit` | 9 sounds: punches, a wooden gavel knock, a shovel clang, a slap | something landing on a head, or the racquet connecting |
| `clunk` | 3 sounds of post going into a metal mailbox | a newspaper landing in a mailbox |
| `stretch` | 9 creaks of rope being pulled tight | a neck stretching, a bit over half the time |
| `spring` | 9 sounds: cartoon twangs, a large spring, a door spring | a neck stretching, about a third of the time |

They are all from BigSoundBank.com (Joseph Sardin), released under Creative
Commons CC0 1.0: free for any use, no credit required. The title screen
credits the site anyway. `tools/make_sfx.py` downloads them, cuts out the
parts listed in its `CLIPS`, and builds `public/sfx/effects.mp3` and
`src/data/sfx.ts`. To add variety, add a line to `CLIPS` (the group, the
sound's number on the site, and the start and end of the part to use) and run
it again. How often the mouth sounds turn up instead is set in `bonk()` and
`boing()` in `src/audio/sound.ts`.

Punches, knocks and creaks are nearly all spike and no body, so the tool
levels every clip by its loudest moment (to match the family's mouth sounds)
rather than by its peak, and rounds the spikes off. Set by their peaks, they
were too quiet to hear under the music.

## Changing or adding a line

- **A new take of an existing line:** add it to the end of the recording (or
  record a new file and point `SRC` at it), change that line's times in
  `CUTS`, and run `python tools/make_voice.py`.
- **A new line:** add a row to `CUTS` with a new id, run the tool, then give
  the phrase that id in `src/data/phrases.ts` (`voice: 'the_id'`).
- **Different words for a line:** change its `text` in `src/data/phrases.ts`
  so the speech bubble matches what is said.
