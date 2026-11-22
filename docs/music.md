# Music

Each level has its own recording, in the style of its era. The files are in
`public/music/`, named after the level's id, and `tools/make_music.sh` fetches
and prepares them: the first minute and a half of each track, faded at the
end, all levelled to the same loudness. A level is about a minute long; if it
outlasts its track, the track goes round again.

| Level | File | Track | Why |
| --- | --- | --- | --- |
| Paper Route | `street.mp3` | "Sock Hop" | Relaxed 1950s rock with tremolo guitar and vibraphone |
| Highway Jam | `highway.mp3` | "Happy Bee - Surf" | Early surf rock, mid-tempo |
| The SKIPPY Jar | `locker.mp3` | "Sneaky Snitch" | Tiptoeing oboe, snare and plucked strings |
| The Hot Carl | `sleepover.mp3` | "Marty Gots a Plan" | Plucked strings for sneaking round the house; it drops to a hush whenever the light is off |

## Credit (required by the licence)

All four tracks are by Kevin MacLeod (incompetech.com), licensed under
Creative Commons: By Attribution 4.0
(https://creativecommons.org/licenses/by/4.0/). They are free to use as long
as that credit appears with the game: it is on the title screen and here.

- "Sock Hop" Kevin MacLeod (incompetech.com)
- "Happy Bee - Surf" Kevin MacLeod (incompetech.com)
- "Sneaky Snitch" Kevin MacLeod (incompetech.com)
- "Marty Gots a Plan" Kevin MacLeod (incompetech.com)

## Changing a track

Edit the list at the bottom of `tools/make_music.sh` (level id, then the
track's file name at incompetech.com) and run it again. Any other recording
works too: put an MP3 named after the level's id in `public/music/`.

Other tracks from the same catalogue that would suit, if one of these wears
thin: "Happy Bee" or "Vivacity" (fifties), "Surf Inspector" (surf, a little
slower and cooler), "Sneaky Adventure" or "Hidden Agenda" (capers).

## Custom music

Tracks written for the game can replace these. Three prompts are set up as
music nodes in an ElevenLabs flow ("Game music: three level themes"), 70
seconds each, instrumental; each costs about 1,050 credits to generate:

- Paper Route: a cheerful 1950s sitcom-theme shuffle at 104 bpm with walking
  upright bass, brushed snare, vibraphone and hollow-body guitar.
- Highway Jam: laid-back early-1960s surf rock at 116 bpm with a twangy,
  reverb-drenched guitar melody.
- The SKIPPY Jar: a sneaky late-1960s caper groove at 100 bpm with plucked
  bass, bongos, Hammond organ stabs and a flute lead.
