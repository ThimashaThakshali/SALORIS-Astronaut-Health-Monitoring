interface SalorisMarkProps {
  compact?: boolean;
}

// Displays the SALORIS logo.
// The compact option is used for the smaller sidebar logo.
export function SalorisMark({ compact = false }: SalorisMarkProps) {
  return (
    <svg
      className={compact ? "saloris-mark compact" : "saloris-mark"}
      viewBox="0 0 52 52"
      role="img"
      aria-label="SALORIS"
    >
      <path
        className="saloris-orbit"
        d="M7 28C11 12 30 4 43 14c8 7 5 18-6 24C26 44 12 39 7 28Z"
      />
      <path className="saloris-horizon" d="M9 30c8-5 14-7 22-5 5 1 8 4 12 8" />
      <path className="saloris-pulse" d="M10 29h8l3-7 5 15 5-10 3 4h9" />
      <circle cx="40.5" cy="13.5" r="2.5" />
    </svg>
  );
}
