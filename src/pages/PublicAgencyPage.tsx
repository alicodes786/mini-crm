import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DecorativeHeroVisual } from '../components/DecorativeHeroVisual'
import { PublicContactForm } from '../components/PublicContactForm'
import { PublicGradientLayout } from '../components/PublicGradientLayout'
import { supabase } from '../lib/supabase'
import type { Agency } from '../types'

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
      <PublicGradientLayout>
        <div className="flex min-h-[40vh] items-center justify-center py-8">
          <div className="flex items-center gap-3 rounded-full border border-stone-200/80 bg-white/90 px-5 py-3 text-sm font-medium text-stone-600 shadow-sm backdrop-blur-sm">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-hidden
            />
            Loading…
          </div>
        </div>
      </PublicGradientLayout>
    )
  }

  if (fetchError) {
    return (
      <PublicGradientLayout>
        <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-8 shadow-sm ring-1 ring-red-900/5">
          <h1 className="text-lg font-bold text-stone-900">Could not load</h1>
          <p className="mt-2 text-sm text-stone-600">{fetchError}</p>
        </div>
      </PublicGradientLayout>
    )
  }

  if (notFound || !agency) {
    return (
      <PublicGradientLayout>
        <div className="rounded-2xl border border-stone-200/80 bg-white/90 p-8 shadow-lg shadow-stone-200/30 ring-1 ring-stone-900/5 backdrop-blur-sm">
          <DecorativeHeroVisual className="mb-6 h-12 w-24 opacity-60" />
          <h1 className="text-xl font-bold text-stone-900">Page not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            This link may be invalid or the organization may no longer be available.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            If the agency exists in Supabase but you still see this, anonymous reads on{' '}
            <code className="rounded-md bg-stone-100 px-1 py-0.5 font-mono text-[11px] text-stone-700">
              agencies
            </code>{' '}
            may be blocked by RLS — run{' '}
            <code className="rounded-md bg-stone-100 px-1 py-0.5 font-mono text-[11px] text-stone-700">
              supabase/fix-agencies-public-read.sql
            </code>
            .
          </p>
        </div>
      </PublicGradientLayout>
    )
  }

  return (
    <PublicGradientLayout>
      <div className="text-center">
        <DecorativeHeroVisual className="mx-auto h-14 w-28" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700/80">Get in touch</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{agency.name}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
          Leave your details and we&apos;ll get back to you.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-xl shadow-stone-200/40 ring-1 ring-stone-900/5 backdrop-blur-sm sm:p-8">
        <PublicContactForm agencySlug={agency.slug} agencyName={agency.name} />
      </div>
    </PublicGradientLayout>
  )
}
