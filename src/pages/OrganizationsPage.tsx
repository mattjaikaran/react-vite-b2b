import { useState } from 'react'
import { useOrganization, useCreateOrganization } from '@/lib/organizations'

export default function OrganizationsPage() {
  const { organizations, currentOrg, setCurrentOrg } = useOrganization()
  const createOrg = useCreateOrganization()
  const [showForm, setShowForm] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgSlug, setNewOrgSlug] = useState('')

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName || !newOrgSlug) return
    await createOrg.mutateAsync({ name: newOrgName, slug: newOrgSlug })
    setNewOrgName('')
    setNewOrgSlug('')
    setShowForm(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          Create Organization
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateOrg} className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">New Organization</h2>
          <div className="flex gap-x-4">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization name"
              aria-label="Organization name"
              className="input flex-1"
              required
            />
            <input
              type="text"
              value={newOrgSlug}
              onChange={(e) => setNewOrgSlug(e.target.value)}
              placeholder="slug"
              aria-label="Organization slug"
              className="input flex-1"
              required
            />
            <button type="submit" className="btn-primary" disabled={createOrg.isPending}>
              {createOrg.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {organizations.map((org) => (
          <div key={org.id} className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary-100 text-xl font-bold text-primary-700">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{org.name}</h2>
                  <p className="text-sm text-gray-500">
                    {org.role} · {org.plan} plan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-x-3">
                {currentOrg?.id === org.id ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                    Current
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentOrg(org)}
                    className="btn-outline text-sm"
                  >
                    Switch
                  </button>
                )}
                <a href={`/organizations/${org.id}/settings`} className="btn-outline text-sm">
                  Settings
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
