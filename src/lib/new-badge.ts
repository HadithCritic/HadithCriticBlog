const NEW_BADGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isNewPost(date: Date): boolean {
  return Date.now() - date.valueOf() < NEW_BADGE_WINDOW_MS;
}
