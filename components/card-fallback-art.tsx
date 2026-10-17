// Cartoon village shown on the ~530 cards whose commune has no photo. The INSEE code seeds the
// sky, the hills and the houses, so that two such cards rarely look alike.

const SKIES = [
  ["#8fd3ff", "#d8f1ff"], // clear day
  ["#ffb38a", "#ffe3c2"], // sunset
  ["#c7b8ff", "#f1e9ff"], // dawn
  ["#a9c4d6", "#e4edf2"], // overcast
] as const;
const HILLS = [
  ["#7cc576", "#4f9e57"],
  ["#a8d080", "#6fae5b"],
  ["#9fcf9a", "#5c9a6e"],
] as const;
const ROOFS = ["#d9534f", "#c0703f", "#8a5a44", "#5b6f8a"] as const;
const WALLS = ["#fff4e0", "#f6e3c6", "#ffffff", "#f1d9c7"] as const;

// FNV-1a: a stable number from a string.
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(list: readonly T[], seed: number): T {
  return list[seed % list.length]!;
}

function House({ x, roof, wall }: { x: number; roof: string; wall: string }) {
  return (
    <g transform={`translate(${x} 72)`}>
      <rect x="0" y="10" width="22" height="18" fill={wall} />
      <path d="M-3 11 L11 0 L25 11 Z" fill={roof} />
      <rect x="8" y="18" width="6" height="10" fill="#7a5638" />
      <rect x="2.5" y="13" width="4" height="4" fill="#9fd2ff" />
      <rect x="15.5" y="13" width="4" height="4" fill="#9fd2ff" />
    </g>
  );
}

function Church({ x, roof, wall }: { x: number; roof: string; wall: string }) {
  return (
    <g transform={`translate(${x} 52)`}>
      <rect x="0" y="22" width="34" height="26" fill={wall} />
      <path d="M-3 23 L17 10 L37 23 Z" fill={roof} />
      <rect x="11" y="0" width="12" height="26" fill={wall} />
      <path d="M9 2 L17 -16 L25 2 Z" fill={roof} />
      <line
        x1="17"
        y1="-16"
        x2="17"
        y2="-23"
        stroke="#5b4636"
        strokeWidth="1.5"
      />
      <line
        x1="14"
        y1="-20"
        x2="20"
        y2="-20"
        stroke="#5b4636"
        strokeWidth="1.5"
      />
      <circle cx="17" cy="9" r="3" fill="#f5c66b" />
      <path d="M13 48 V38 a4 4 0 0 1 8 0 V48 Z" fill="#7a5638" />
    </g>
  );
}

export function CardFallbackArt({ seed }: { seed: string }) {
  const h = hash(seed);
  const [skyTop, skyBottom] = pick(SKIES, h);
  const [hillBack, hillFront] = pick(HILLS, h >>> 3);
  const churchLeft = ((h >>> 6) & 1) === 0;
  const houses = 2 + ((h >>> 7) % 3);
  const id = `sky-${seed}`;

  return (
    <svg
      viewBox="0 0 160 120"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill={`url(#${id})`} />
      <circle cx={churchLeft ? 128 : 30} cy="24" r="11" fill="#fff3b0" />
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx={40 + (h % 60)} cy="30" rx="16" ry="6" />
        <ellipse cx={52 + (h % 60)} cy="26" rx="10" ry="6" />
      </g>
      <path d="M0 82 Q40 58 80 74 T160 66 V120 H0 Z" fill={hillBack} />
      {Array.from({ length: houses }, (_, i) => (
        <House
          key={i}
          x={(churchLeft ? 62 : 14) + i * 27}
          roof={pick(ROOFS, (h >>> (9 + i * 2)) + i)}
          wall={pick(WALLS, (h >>> (12 + i)) + i)}
        />
      ))}
      <Church
        x={churchLeft ? 18 : 108}
        roof={pick(ROOFS, h >>> 15)}
        wall={pick(WALLS, h >>> 17)}
      />
      <path d="M0 100 Q50 88 100 98 T160 94 V120 H0 Z" fill={hillFront} />
      <g fill="#3f7d46">
        <circle cx={churchLeft ? 148 : 8} cy="92" r="7" />
        <rect
          x={churchLeft ? 147 : 7}
          y="96"
          width="2"
          height="8"
          fill="#6b4a2e"
        />
      </g>
    </svg>
  );
}
