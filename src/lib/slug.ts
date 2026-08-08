import type { FieldHook } from 'payload'

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Fills the slug from a source field when the editor leaves it blank,
 * but never overwrites a slug that has been set by hand — changing a live
 * URL silently would break inbound links and search rankings.
 */
export const slugFromField =
  (sourceField: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    if (operation === 'create' || operation === 'update') {
      const source = data?.[sourceField]
      if (typeof source === 'string' && source.length > 0) return slugify(source)
    }
    return value
  }
