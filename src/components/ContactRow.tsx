import type { Contact, ContactStatus } from '../types'

const statusAccent: Record<ContactStatus, string> = {
  new: 'border-l-teal-500',
  contacted: 'border-l-amber-500',
  discarded: 'border-l-stone-300',
}

type Props = {
  contact: Contact
  onStatusChange: (id: string, status: ContactStatus) => void
  busyId: string | null
}

export function ContactRow({ contact, onStatusChange, busyId }: Props) {
  const busy = busyId === contact.id

  return (
    <tr
      className={`group border-b border-stone-100 align-top border-l-4 transition-colors hover:bg-teal-50/30 ${statusAccent[contact.status]}`}
    >
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-stone-500 tabular-nums">
        {new Date(contact.created_at).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </td>
      <td className="py-4 pr-3 text-sm font-semibold text-stone-900">{contact.name}</td>
      <td className="py-4 pr-3">
        <a
          href={`mailto:${encodeURIComponent(contact.email)}`}
          className="text-sm font-medium text-teal-700 underline decoration-teal-600/25 underline-offset-2 hover:text-teal-800"
        >
          {contact.email}
        </a>
      </td>
      <td className="max-w-[min(28rem,45vw)] py-4 pr-3 text-sm leading-relaxed text-stone-600">
        {contact.message}
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-2">
          <select
            className="w-full min-w-[9.5rem] cursor-pointer rounded-lg border border-stone-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold uppercase tracking-wide text-stone-700 shadow-sm outline-none transition focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 disabled:cursor-wait disabled:opacity-60"
            value={contact.status}
            disabled={busy}
            onChange={(e) => onStatusChange(contact.id, e.target.value as ContactStatus)}
            aria-label={`Status for ${contact.name}`}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="discarded">Discarded</option>
          </select>
          {busy ? (
            <span
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-hidden
            />
          ) : null}
        </div>
      </td>
    </tr>
  )
}
