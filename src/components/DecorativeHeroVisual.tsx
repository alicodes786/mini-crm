import { useId } from 'react'

type Props = {
  className?: string
}

/** Abstract mark only — no logo text. */
export function DecorativeHeroVisual({ className = 'mx-auto h-14 w-24' }: Props) {
  const gid = useId().replace(/:/g, '')

  return (
    <svg
      className={className}
      viewBox="0 0 88 56"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gid} x1="8" y1="6" x2="78" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" stopOpacity="0.95" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <ellipse cx="44" cy="30" rx="38" ry="20" fill={`url(#${gid})`} opacity="0.28" />
      <circle cx="30" cy="26" r="15" fill={`url(#${gid})`} opacity="0.62" />
      <circle cx="56" cy="34" r="12" fill="#115e59" opacity="0.38" />
    </svg>
  )
}
