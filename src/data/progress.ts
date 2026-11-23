/** Best star rating per level, remembered on this device. Storage can be
 *  unavailable (private windows, embedded previews), so every access is guarded
 *  and the game works the same without it. */

const KEY = 'rubber-necker-stars';

export function loadStars(): Record<string, number> {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return all && typeof all === 'object' ? all : {};
  } catch {
    return {};
  }
}

export function saveStars(levelId: string, stars: number): void {
  try {
    const all = loadStars();
    if ((all[levelId] ?? 0) >= stars) return;
    all[levelId] = stars;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // nowhere to save: carry on
  }
}

/** Best score at something that is counted rather than starred (the quick games). */
export function loadBest(what: string): number {
  try {
    return Number(localStorage.getItem(`rubber-necker-best-${what}`)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(what: string, score: number): void {
  try {
    if (score > loadBest(what)) localStorage.setItem(`rubber-necker-best-${what}`, String(score));
  } catch {
    // nowhere to save: carry on
  }
}
