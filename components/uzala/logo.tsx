export function UzalaLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Tulip mark: twin petals flaring to soft points with center stem */}
        <path
          d="M20 31C11 27.5 7 20.5 7 11c5.6 0 10.4 3.4 13 9"
          stroke="var(--primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 31c9-3.5 13-10.5 13-20-5.6 0-10.4 3.4-13 9"
          stroke="var(--primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 20v11"
          stroke="var(--primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[0.95rem] font-medium tracking-[0.45em] text-foreground/95">
        UZALA
      </span>
    </div>
  )
}
