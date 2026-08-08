import type { CollectionBeforeChangeHook } from 'payload'
import { userCanPublish } from '../access/roles'

/**
 * Payload owns `_status` when drafts are enabled, so publishing permission is
 * enforced here rather than through field access. Running it as a hook means
 * the rule holds for REST, GraphQL and the Local API — not just the admin UI.
 */
export const publishGuard: CollectionBeforeChangeHook = ({ data, req, originalDoc }) => {
  if (req.user && !userCanPublish(req.user) && data?._status === 'published') {
    return { ...data, _status: originalDoc?._status ?? 'draft' }
  }
  return data
}
