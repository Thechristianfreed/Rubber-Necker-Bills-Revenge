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
