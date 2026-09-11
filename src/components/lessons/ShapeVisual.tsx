export function ShapeVisual({ shape }: { shape: string }) {
  const common = { fill: "#7292bf", stroke: "#36577e", strokeWidth: 3 };
  return (
    <svg
      role="img"
      aria-label={shape}
      viewBox="0 0 160 130"
      className="my-5 h-36 w-48"
    >
      {shape === "circle" ? (
        <circle cx="80" cy="65" r="50" {...common} />
      ) : shape === "square" ? (
        <rect x="30" y="15" width="100" height="100" {...common} />
      ) : shape === "triangle" ? (
        <polygon points="80,10 145,115 15,115" {...common} />
      ) : shape === "rectangle" ? (
        <rect x="10" y="25" width="140" height="80" {...common} />
      ) : shape === "oval" ? (
        <ellipse cx="80" cy="65" rx="70" ry="45" {...common} />
      ) : (
        <polygon
          points="80,8 97,45 138,48 108,77 116,119 80,99 44,119 52,77 22,48 63,45"
          {...common}
        />
      )}
    </svg>
  );
}
