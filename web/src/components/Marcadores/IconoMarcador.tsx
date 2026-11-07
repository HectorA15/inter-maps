interface IconoMarcadorProps {
  icono: string | null;
  size?: number;
}

export function IconoMarcador({ icono, size = 22 }: IconoMarcadorProps) {
  if (
    !icono ||
    !["wifi", "info", "parking", "first-aid", "store"].includes(icono)
  ) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icono === "wifi" && (
        <>
          <path d="M5 10.5a11 11 0 0 1 14 0" />
          <path d="M8 14a6.5 6.5 0 0 1 8 0" />
          <path d="M11 17.5a2 2 0 0 1 2 0" />
          <circle cx="12" cy="20" r="0.5" fill="currentColor" />
        </>
      )}
      {icono === "info" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </>
      )}
      {icono === "parking" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 17V7h3a3 3 0 0 1 0 6h-3" />
        </>
      )}
      {icono === "first-aid" && (
        <>
          <rect x="4" y="6" width="16" height="13" rx="2" />
          <path d="M9 6V4h6v2" />
          <path d="M12 10v5" />
          <path d="M9.5 12.5h5" />
        </>
      )}
      {icono === "store" && (
        <>
          <path d="M3 5h2l2.4 10.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 1.9-1.4L21 9H6" />
          <circle cx="10" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
        </>
      )}
    </svg>
  );
}
