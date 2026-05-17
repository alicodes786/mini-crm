import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Agency } from '../types'
import { PublicContactForm } from '../components/PublicContactForm'

export function PublicAgencyPage() {
  const { agencySlug = '' } = useParams()
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const slug = agencySlug.trim().toLowerCase()

    async function run() {
      if (!slug) {
        setNotFound(true)
        setAgency(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setNotFound(false)
      setFetchError(null)

      const { data, error } = await supabase
        .from('agencies')
        .select('id,name,slug')
        .eq('slug', slug)
        .maybeSingle()

      if (cancelled) return
      if (error) {
        setFetchError(error.message)
        setAgency(null)
        setNotFound(false)
      } else if (!data) {
        setAgency(null)
        setNotFound(true)
      } else {
        setAgency(data as Agency)
        setNotFound(false)
      }
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [agencySlug])

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-sm text-neutral-600">Loading…</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-lg font-semibold text-neutral-900">Could not load agency</h1>
        <p className="mt-2 text-sm text-neutral-600">{fetchError}</p>
      </div>
    )
  }

  if (notFound || !agency) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-lg font-semibold text-neutral-900">Agency not found</h1>
        <p className="mt-2 text-sm text-neutral-600">
          This link may be invalid or the agency may no longer be available.
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          Data tip: if the row exists in the Table Editor but this still shows, RLS is probably blocking
          anonymous reads on <code className="rounded bg-neutral-100 px-1">agencies</code>. Run{' '}
          <code className="rounded bg-neutral-100 px-1">supabase/fix-agencies-public-read.sql</code>{' '}
          in the SQL Editor.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-xl font-semibold text-neutral-900">{agency.name}</h1>
      <p className="mt-1 text-sm text-neutral-600">Leave your details and we&apos;ll reach out.</p>
      <div className="mt-6">
        <PublicContactForm agencySlug={agency.slug} agencyName={agency.name} />
      </div>
    </div>
  )
}
