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
| Home Movies (the quick games) | `minis.mp3` | "Newer Wave" | Eighties synth-pop, for a workout tape |
| Mom's workout tape (one of the quick games) | `workout.mp3` | The tape's own music | See "The workout tape" below |

## Credit (required by the licence)

All five tracks are by Kevin MacLeod (incompetech.com), licensed under
Creative Commons: By Attribution 4.0
(https://creativecommons.org/licenses/by/4.0/). They are free to use as long
as that credit appears with the game: it is on the title screen and here.

- "Sock Hop" Kevin MacLeod (incompetech.com)
- "Happy Bee - Surf" Kevin MacLeod (incompetech.com)
- "Sneaky Snitch" Kevin MacLeod (incompetech.com)
- "Marty Gots a Plan" Kevin MacLeod (incompetech.com)
- "Newer Wave" Kevin MacLeod (incompetech.com)

## The workout tape

Mom's workout tape plays the real tape's music, and its breathing is the
real instructor's: the breath in and the "PAH". All of it comes from one
twelve-second recording of the tape, cut up by `tools/make_tape.py`:

- `public/music/workout.mp3`: three bars of the music with nobody breathing
  over them (six seconds), joined end to start and going round six times.
- `public/sfx/tape.mp3`: the breath in and the "PAH", with the music that was
  playing under them taken out.

The recording itself is `audio-src/tape/workout.m4a`; run
`python tools/make_tape.py` (it needs numpy and ffmpeg) to make the two files
again, or point it at a longer recording for a longer loop. If either file is
missing the game carries on without it: the quick games' usual music plays
under the workout, and the breathing is synthesised.

That recording belongs to whoever made the tape, not to us. It is here
because this is a present for the family; think again before putting it in
an app store.

## The announcer at the end of the fight

The fight after school ends with an arcade announcer: "Flawless victory",
and two seconds later "Fatality". It is the clip the owner sent
(`audio-src/fight/flawless-fatality.mp3`, from Mortal Kombat), trimmed and
made mono:

```bash
ffmpeg -i audio-src/fight/flawless-fatality.mp3 -ac 1 -ar 44100 -af "atrim=0:3.45,afade=t=in:st=0:d=0.01,afade=t=out:st=3.0:d=0.45" -b:a 96k public/sfx/fatality.mp3
```

The words FLAWLESS VICTORY and FATALITY go up on the screen in time with it
(`FATALITY_AT` in `src/minis/FightMini.ts` is how far into the clip the
second one is said). If the file is missing, the fight ends on the usual
groan and sad notes, with the same words.

Like the tape, this recording is not ours: it belongs to the makers of that
game. The same caution applies before this goes anywhere near an app store.

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
