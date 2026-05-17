import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Contact } from '../types'

function sortByCreatedAtDesc(rows: Contact[]) {
  return [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function useContacts(agencyId: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyInsert = useCallback((row: Contact) => {
    setContacts((prev) => {
      if (prev.some((c) => c.id === row.id)) return prev
      return sortByCreatedAtDesc([row, ...prev])
    })
  }, [])

  const applyUpdate = useCallback((row: Contact) => {
    setContacts((prev) => {
      if (!prev.some((c) => c.id === row.id)) return sortByCreatedAtDesc([row, ...prev])
      return prev
        .map((c) => (c.id === row.id ? row : c))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
  }, [])

  useEffect(() => {
    if (!agencyId) {
      setContacts([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchInitial() {
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setContacts([])
      } else {
        setContacts((data ?? []) as Contact[])
      }
      setLoading(false)
    }

    const channel = supabase
      .channel(`contacts-agency-${agencyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contacts',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          applyInsert(payload.new as Contact)
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          applyUpdate(payload.new as Contact)
        },
      )
      .subscribe()

    void fetchInitial()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [agencyId, applyInsert, applyUpdate])

  const updateStatus = useCallback(async (contactId: string, status: Contact['status']) => {
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', contactId)

    if (updateError) throw updateError
    // Realtime UPDATE will sync other clients; apply locally for snappy UI.
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, status } : c)),
    )
  }, [])

  return { contacts, loading, error, updateStatus }
}
