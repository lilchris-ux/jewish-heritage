import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Administration',
  },
  access: {
    // Users may always read and update their own record; only super admins
    // may see or alter anyone else's.
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return { id: { equals: user.id } }
    },
    create: isSuperAdmin,
    delete: isSuperAdmin,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return { id: { equals: user.id } }
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Client Admin', value: 'client-admin' },
        { label: 'Editor', value: 'editor' },
      ],
      // Without this, an editor could promote themselves.
      access: { update: ({ req: { user } }) => user?.role === 'super-admin' },
      admin: { description: 'Controls what this person can see and do in the CMS.' },
    },
  ],
}
