import type { Access } from 'payload'

export type Role = 'super-admin' | 'client-admin' | 'editor'

type MaybeUser = { role?: Role | null } | null | undefined

const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.role && roles.includes(user.role))

/** Anyone signed into the CMS. */
export const isAdminUser: Access = ({ req: { user } }) => Boolean(user)

/** Super admins only — users, analytics settings, destructive operations. */
export const isSuperAdmin: Access = ({ req: { user } }) => hasRole(user as MaybeUser, 'super-admin')

/** Super admins and the client's own administrators. */
export const isAdminOrClientAdmin: Access = ({ req: { user } }) =>
  hasRole(user as MaybeUser, 'super-admin', 'client-admin')

/**
 * Public read for published documents; signed-in users see drafts too.
 * Returned as a Where clause so the rule holds for REST and GraphQL alike,
 * not just the admin UI.
 */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/**
 * Publishing is restricted to admins. Payload owns the `_status` field when
 * drafts are enabled, so this is enforced by a beforeChange hook on each
 * collection rather than field access — which also means it holds for REST,
 * GraphQL and the Local API, not just the admin UI.
 */
export const userCanPublish = (user: unknown): boolean =>
  hasRole(user as MaybeUser, 'super-admin', 'client-admin')
