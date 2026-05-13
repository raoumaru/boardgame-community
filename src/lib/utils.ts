export function formatPlayers(min: number, max: number): string {
  if (min === max) return `${min}人`
  return `${min}〜${max}人`
}

export function formatPlayTime(min: number, max: number | null): string {
  if (!max || min === max) return `${min}分`
  return `${min}〜${max}分`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
