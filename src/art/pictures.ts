/** Where the pictures are.
 *
 *  As the game is built by Vite, every picture is written into the page itself.
 *  A page that is to be published has them taken out again (tools/pack_pictures.mjs):
 *  there is a limit to how big a page may be, and the pictures were most of it. Each
 *  picture's address in the code is then a ticket, `pic:<n>`, and the pictures are in
 *  files beside the page, a few megabytes each, which the page lists in
 *  `window.__PICTURES`. They are fetched once, before anything is drawn.
 *
 *  If a file of them cannot be had, the game says so and goes on: whatever was in it
 *  stays as the cut paper it would have replaced. */
const FILES: string[] = (window as unknown as { __PICTURES?: string[] }).__PICTURES ?? [];
const found = new Map<string, string>();
let fetched: Promise<void> | undefined;

/** Fetch the pictures that are kept beside the page (at once, if there are none). */
export function loadPictures(): Promise<void> {
  fetched ??= Promise.all(FILES.map(async (file) => {
    try {
      const reply = await fetch(new URL(file, document.baseURI));
      if (!reply.ok) throw new Error(`${reply.status}`);
      for (const [ticket, data] of Object.entries((await reply.json()) as Record<string, string>)) found.set(ticket, data);
    } catch (e) {
      console.error(`the pictures in ${file} could not be loaded (${(e as Error).message}): paper is shown where they belong`);
    }
  })).then(() => undefined);
  return fetched;
}

/** A picture's real address: what it was given as, unless that is a ticket for one kept beside the page. */
export function picture(url: string | undefined): string | undefined {
  return url?.startsWith('pic:') ? found.get(url) : url;
}
