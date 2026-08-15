type MarkProps = { active: boolean };

function ink(active: boolean): string {
  return active ? "var(--ink-violet)" : "var(--slate-60)";
}

export function BorderMark(props: { id: string } & MarkProps) {
  const stroke = ink(props.active);
  const fill = props.active ? "var(--gel-coral)" : "var(--icing-white)";
  return (
    <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden="true">
      {props.id === "shell" ? (
        <path
          d="M6 24 C10 8 18 8 22 24 C26 8 34 8 38 24 C42 8 50 8 54 24 C58 8 66 8 74 24"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />
      ) : null}
      {props.id === "bead" ? (
        <g fill={fill} stroke={stroke} strokeWidth="1.5">
          <circle cx="12" cy="16" r="6" />
          <circle cx="28" cy="16" r="6" />
          <circle cx="44" cy="16" r="6" />
          <circle cx="60" cy="16" r="6" />
        </g>
      ) : null}
      {props.id === "ruffle" ? (
        <path
          d="M4 22 Q12 6 20 22 Q28 6 36 22 Q44 6 52 22 Q60 6 68 22 Q76 10 76 22"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />
      ) : null}
      {props.id === "wavy" ? (
        <path d="M4 16 Q16 4 28 16 T52 16 T76 16" fill="none" stroke={stroke} strokeWidth="2" />
      ) : null}
      {props.id === "straight" ? (
        <path d="M4 16 H76" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      ) : null}
      {props.id === "reverse_shell" ? (
        <path
          d="M8 10 C18 10 18 24 28 24 C38 24 38 10 48 10 C58 10 58 24 70 24"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />
      ) : null}
      {props.id === "band" ? (
        <rect x="6" y="10" width="68" height="12" fill={fill} stroke={stroke} strokeWidth="1.5" />
      ) : null}
      {props.id === "rope" ? (
        <path
          d="M6 20 C14 8 22 8 30 20 C38 32 46 32 54 20 C62 8 70 8 76 16"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />
      ) : null}
      {props.id === "zigzag" ? (
        <path
          d="M6 22 L16 10 L26 22 L36 10 L46 22 L56 10 L66 22 L74 12"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />
      ) : null}
      {![
        "shell",
        "bead",
        "ruffle",
        "wavy",
        "straight",
        "reverse_shell",
        "band",
        "rope",
        "zigzag",
      ].includes(props.id) ? (
        <path d="M8 16 H72" fill="none" stroke={stroke} strokeWidth="2" strokeDasharray="4 3" />
      ) : null}
    </svg>
  );
}

export function NozzleMark(props: { id: string } & MarkProps) {
  const stroke = ink(props.active);
  const fill = props.active ? "var(--gel-teal)" : "var(--icing-white)";
  return (
    <svg viewBox="0 0 40 40" className="mx-auto h-10 w-10" aria-hidden="true">
      {props.id === "round" ? <circle cx="20" cy="20" r="8" fill={fill} stroke={stroke} /> : null}
      {props.id === "open_star" ? (
        <path
          d="M20 4 L23 15 L34 15 L25 22 L28 34 L20 26 L12 34 L15 22 L6 15 L17 15 Z"
          fill={fill}
          stroke={stroke}
        />
      ) : null}
      {props.id === "closed_star" ? (
        <path
          d="M20 6 L24 16 L34 16 L26 22 L29 32 L20 26 L11 32 L14 22 L6 16 L16 16 Z"
          fill={fill}
          stroke={stroke}
        />
      ) : null}
      {props.id === "french_star" ? (
        <path
          d="M20 5 L22 14 H30 L24 19 L26 28 L20 23 L14 28 L16 19 L10 14 H18 Z"
          fill={fill}
          stroke={stroke}
        />
      ) : null}
      {props.id === "leaf" ? (
        <path d="M8 28 C12 8 28 8 32 28 C24 24 16 24 8 28 Z" fill={fill} stroke={stroke} />
      ) : null}
      {props.id === "petal" ? (
        <path d="M10 30 C10 10 30 10 30 30" fill={fill} stroke={stroke} />
      ) : null}
      {props.id === "basketweave" ? (
        <g stroke={stroke} fill="none">
          <rect x="8" y="8" width="24" height="24" />
          <path d="M8 16 H32 M8 24 H32 M16 8 V32 M24 8 V32" />
        </g>
      ) : null}
      {props.id === "grass" ? (
        <path
          d="M8 32 L12 8 M16 32 L20 10 M24 32 L28 8 M32 32 L34 14"
          fill="none"
          stroke={stroke}
        />
      ) : null}
    </svg>
  );
}
