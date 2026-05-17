import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { DecorativeHeroVisual } from '../components/DecorativeHeroVisual'
import { PublicGradientLayout } from '../components/PublicGradientLayout'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { session, loading, signIn } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/inbox'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <PublicGradientLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-stone-200/80 bg-white/90 px-5 py-3 text-sm font-medium text-stone-600 shadow-sm backdrop-blur-sm">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-hidden
            />
            Checking session…
          </div>
        </div>
      </PublicGradientLayout>
    )
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email.trim(), password)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicGradientLayout className="max-w-md">
      <div className="mb-8 text-center">
        <DecorativeHeroVisual className="mx-auto h-16 w-32" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Agent sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Access your agency lead inbox.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200/80 bg-white/90 p-8 shadow-xl shadow-stone-200/40 ring-1 ring-stone-900/5 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-stone-900">Welcome back</span>
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800 ring-1 ring-teal-600/15">
            Agents only
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-teal-500/40 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-teal-500/40 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:from-teal-500 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden
                />
                Signing in…
              </>
            ) : (
              'Sign in to inbox'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500">
          Public lead forms live at{' '}
          <code className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-700">
            /c/your-agency-slug
          </code>
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-stone-500">
        <Link
          className="font-medium text-teal-700 underline decoration-teal-600/30 underline-offset-4 transition hover:text-teal-800"
          to="/"
        >
          ← Back to home
        </Link>
      </p>
    </PublicGradientLayout>
  )
}
