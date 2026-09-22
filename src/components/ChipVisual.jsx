import '../styles/chipVisual.css';

const EDGE_ANGLES = Array.from({ length: 8 }, (_, index) => index * 45);

const DOTS = [
  [60, 13],
  [93, 27],
  [107, 60],
  [93, 93],
  [60, 107],
  [27, 93],
  [13, 60],
  [27, 27],
];

function getValueFontSize(value) {
  const length = String(value).length;

  if (length <= 3) return 30;
  if (length === 4) return 25;
  if (length === 5) return 21;
  return 17;
}

export default function ChipVisual({ chip, size, className = '' }) {
  const style = size ? { width: `${size}px` } : undefined;

  return (
    <svg
      className={`chip-visual ${className}`.trim()}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${chip.name || chip.key}-chip, verdi ${chip.value}`}
      style={style}
    >
      <defs>
        <clipPath id={`chip-outer-clip-${chip.key}`}>
          <circle cx="60" cy="58" r="52" />
        </clipPath>
      </defs>
      
      <circle
        cx="60"
        cy="62"
        r="52"
        fill="rgba(0, 0, 0, 0.18)"
      />

      <circle
        cx="60"
        cy="58"
        r="53"
        fill={chip.baseColor}
        stroke="rgba(0, 0, 0, 0.5)"
        strokeWidth="2"
      />

      <g clipPath={`url(#chip-outer-clip-${chip.key})`}>
        {EDGE_ANGLES.map((angle) => (
          <rect
            key={angle}
            x="52"
            y="4"
            width="16"
            height="18"
            rx="2"
            fill={chip.edgeColor}
            transform={`rotate(${angle} 60 58)`}
          />
        ))}
      </g>

      <circle
        cx="60"
        cy="58"
        r="40"
        fill={chip.innerColor}
      />

      <circle
        cx="60"
        cy="58"
        r="33.5"
        fill="none"
        stroke={chip.edgeColor}
        strokeWidth="3"
        strokeDasharray="7 5"
      />

      <circle
        cx="60"
        cy="58"
        r="29.5"
        fill={chip.innerColor}
        stroke="rgba(0, 0, 0, 0.24)"
        strokeWidth="1.4"
      />

      {DOTS.map(([cx, cy], index) => (
        <circle
          key={index}
          cx={cx}
          cy={cy - 2}
          r="2.2"
          fill={chip.edgeColor}
        />
      ))}

      <text
        x="60"
        y="59"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={chip.textColor}
        fontSize={getValueFontSize(chip.value)}
        fontWeight="750"
        fontFamily="Inter, Arial, Helvetica, sans-serif"
      >
        {chip.value}
      </text>
    </svg>
  );
}
