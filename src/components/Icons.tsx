type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const base = (size: number, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

export function SearchIcon({ size = 18, strokeWidth = 2.2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function ClearIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}

export function MicIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

export function SpeakerIcon({ size = 20, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export function QuoteIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M9.6 5.4c-3 1.3-4.8 3.9-4.8 7.3V18h6.2v-6H7.7c.1-1.9 1-3.2 2.8-4.1zm9 0c-3 1.3-4.8 3.9-4.8 7.3V18H20v-6h-3.3c.1-1.9 1-3.2 2.8-4.1z" />
    </svg>
  );
}

export function NetworkIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <rect x="9" y="3" width="6" height="5" rx="1.5" />
      <rect x="2.5" y="16" width="6" height="5" rx="1.5" />
      <rect x="15.5" y="16" width="6" height="5" rx="1.5" />
      <path d="M12 8v4M5.5 16v-2.5h13V16" />
    </svg>
  );
}

export function BulbIcon({ size = 17, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M9.2 17a6 6 0 1 1 5.6 0" />
      <path d="M9.5 17h5M10 20.5h4" />
    </svg>
  );
}

export function PlusIcon({ size = 15, strokeWidth = 2.6, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

export function CheckIcon({ size = 15, strokeWidth = 2.8, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CardsIcon({ size = 22, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <rect x="3" y="7" width="13" height="14" rx="2.5" />
      <path d="M8 4h10a3 3 0 0 1 3 3v10" />
    </svg>
  );
}

export function BookIcon({ size = 22, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
    </svg>
  );
}

export function ChartIcon({ size = 22, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M4 17.5 9 12l3.5 3.5L20 7" />
      <path d="M15.5 7H20v4.5" />
    </svg>
  );
}

export function FlameIcon({ size = 14, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M13 2c.4 3-1.2 4.6-2.7 6.1C8.6 9.8 7 11.4 7 14.3A6.2 6.2 0 0 0 13.2 22 6.2 6.2 0 0 0 19 15.6c0-4-2.3-6.3-3.8-8.1A9 9 0 0 1 13 2m-.4 11.3c1.3.9 2.2 1.8 2.2 3.2a2.5 2.5 0 0 1-5 .1c0-1.2.9-2 1.6-2.7z" />
    </svg>
  );
}

export function LogoIcon({ size = 19, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M4 5.5h6a3 3 0 0 1 3 3V20a2.4 2.4 0 0 0-2.4-2.4H4z" fill="currentColor" />
      <path
        d="M20 5.5h-6a3 3 0 0 0-3 3V20a2.4 2.4 0 0 1 2.4-2.4H20z"
        fill="currentColor"
        opacity=".55"
      />
    </svg>
  );
}

export function MatrixIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M3.5 9.5h17M3.5 15.5h17M9.5 3.5v17" />
    </svg>
  );
}

export function PrefixIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <circle cx="5.5" cy="12" r="2.5" />
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M8 11 15.5 6.5M8 13l7.5 4.5" />
    </svg>
  );
}
