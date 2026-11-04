export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count > 1 ? (plural ?? `${singular}s`) : singular
}
