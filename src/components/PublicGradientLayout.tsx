import type { ReactNode } from 'react'

/** Shared backdrop for login + public lead pages. */
export function PublicGradientLayout({
  children,
  className = 'max-w-lg',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-stone-50 via-white to-teal-50/40 px-4 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d9488' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className={`relative mx-auto ${className}`}>{children}</div>
    </div>
  )
}
