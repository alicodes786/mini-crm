import type { Contact, ContactStatus } from '../types'

type Props = {
  contact: Contact
  onStatusChange: (id: string, status: ContactStatus) => void
  busyId: string | null
}

export function ContactRow({ contact, onStatusChange, busyId }: Props) {
  return (
    <tr className="border-b border-neutral-200 align-top">
      <td className="whitespace-nowrap py-2 pr-3 text-sm text-neutral-700">
        {new Date(contact.created_at).toLocaleString()}
      </td>
      <td className="py-2 pr-3 text-sm font-medium text-neutral-900">{contact.name}</td>
      <td className="py-2 pr-3 text-sm text-neutral-800">{contact.email}</td>
      <td className="max-w-md py-2 pr-3 text-sm text-neutral-700">{contact.message}</td>
      <td className="py-2">
        <select
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm"
          value={contact.status}
          disabled={busyId === contact.id}
          onChange={(e) => onStatusChange(contact.id, e.target.value as ContactStatus)}
        >
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="discarded">discarded</option>
        </select>
      </td>
    </tr>
  )
}
