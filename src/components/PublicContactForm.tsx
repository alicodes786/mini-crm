import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  agencySlug: string
  agencyName: string
}

export function PublicContactForm({ agencySlug, agencyName }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { error: rpcError } = await supabase.rpc('submit_public_contact', {
        p_agency_slug: agencySlug,
        p_name: name.trim(),
        p_email: email.trim(),
        p_message: message.trim(),
      })
      if (rpcError) throw rpcError
      setDone(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
        Thanks — {agencyName} will be in touch.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Send'}
      </button>
    </form>
  )
}
