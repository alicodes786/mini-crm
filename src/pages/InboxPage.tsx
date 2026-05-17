import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ContactRow } from '../components/ContactRow'
import { useAuth } from '../context/AuthContext'
import { useContacts } from '../hooks/useContacts'
import type { ContactStatus } from '../types'

export function InboxPage() {
  const { profile, profileLoading, signOut } = useAuth()
  const agencyId = profile?.agency_id ?? null
  const { contacts, loading, error, updateStatus } = useContacts(agencyId)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function onStatusChange(id: string, status: ContactStatus) {
    setBusyId(id)
    try {
      await updateStatus(id, status)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      alert(msg)
    } finally {
      setBusyId(null)
    }
  }

  if (profileLoading) {
    return <p className="px-4 py-6 text-sm text-neutral-600">Loading profile…</p>
  }

  if (!profile) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-lg font-semibold text-neutral-900">No profile</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Your account is missing an agency assignment. Ask an admin to add a row in{' '}
          <code className="rounded bg-neutral-100 px-1">profiles</code>.
        </p>
        <button
          type="button"
          className="mt-4 rounded border border-neutral-300 px-3 py-1.5 text-sm"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Inbox</h1>
          <p className="text-sm text-neutral-600">New submissions appear instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-blue-700 underline" to="/">
            Home
          </Link>
          <button
            type="button"
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-neutral-600">Loading contacts…</p>
      ) : contacts.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">No contacts yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Message</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <ContactRow
                  key={c.id}
                  contact={c}
                  onStatusChange={onStatusChange}
                  busyId={busyId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
