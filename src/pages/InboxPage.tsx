import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ContactRow } from '../components/ContactRow'
import { DecorativeHeroVisual } from '../components/DecorativeHeroVisual'
import { useAuth } from '../context/AuthContext'
import { useContacts } from '../hooks/useContacts'
import type { ContactStatus } from '../types'

function InboxShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-teal-50/30">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(204_251_241),transparent)] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}

export function InboxPage() {
  const { profile, profileLoading, signOut } = useAuth()
  const agencyId = profile?.agency_id ?? null
  const { contacts, loading, error, updateStatus } = useContacts(agencyId)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const counts = useMemo(() => {
    return contacts.reduce(
      (acc, c) => {
        acc[c.status] += 1
        return acc
      },
      { new: 0, contacted: 0, discarded: 0 } as Record<ContactStatus, number>,
    )
  }, [contacts])

  async function onStatusChange(id: string, status: ContactStatus) {
    setBusyId(id)
    setUpdateError(null)
    try {
      await updateStatus(id, status)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      setUpdateError(msg)
    } finally {
      setBusyId(null)
    }
  }

  if (profileLoading) {
    return (
      <InboxShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-stone-200/80 bg-white/90 px-5 py-3 text-sm font-medium text-stone-600 shadow-sm backdrop-blur-sm">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-hidden
            />
            Loading your workspace…
          </div>
        </div>
      </InboxShell>
    )
  }

  if (!profile) {
    return (
      <InboxShell>
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-200/80 bg-amber-50/50 p-8 shadow-sm ring-1 ring-amber-900/5">
          <h1 className="text-lg font-bold text-stone-900">Profile not linked</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Your account is not mapped to an agency yet. Ask an admin to add a row in{' '}
            <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-xs text-stone-800 ring-1 ring-stone-200">
              profiles
            </code>{' '}
            for your user.
          </p>
          <button
            type="button"
            className="mt-6 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </InboxShell>
    )
  }

  return (
    <InboxShell>
      <header className="flex flex-col gap-6 border-b border-stone-200/80 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <DecorativeHeroVisual className="h-11 w-20 shrink-0 sm:h-12 sm:w-24" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Inbox</h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-600">
                Leads from your public form land here. Update status as you work each one.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
            to="/"
          >
            Home
          </Link>
          <button
            type="button"
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-stone-900/15 transition hover:bg-stone-800"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        {(
          [
            ['new', counts.new, 'bg-teal-50 text-teal-900 ring-teal-600/15'] as const,
            ['contacted', counts.contacted, 'bg-amber-50 text-amber-950 ring-amber-600/15'] as const,
            ['discarded', counts.discarded, 'bg-stone-100 text-stone-800 ring-stone-500/10'] as const,
          ] as const
        ).map(([key, n, cls]) => (
          <div
            key={key}
            className={`min-w-[6.5rem] rounded-2xl px-4 py-3 ring-1 ${cls} shadow-sm`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{key}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{n}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}

      {updateError ? (
        <p className="mt-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900" role="alert">
          {updateError}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-10 flex items-center gap-3 text-sm font-medium text-stone-500">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
            aria-hidden
          />
          Loading contacts…
        </div>
      ) : contacts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-8 py-16 text-center shadow-sm ring-1 ring-stone-900/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-teal-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <p className="mt-4 text-base font-semibold text-stone-900">No leads yet</p>
          <p className="mt-2 text-sm text-stone-600">
            When someone submits your public form, their message shows up here right away.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/90 shadow-lg shadow-stone-200/30 ring-1 ring-stone-900/5 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-3 pl-4 pr-3">Received</th>
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 pr-3">Email</th>
                  <th className="py-3 pr-3">Message</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
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
        </div>
      )}
    </InboxShell>
  )
}
