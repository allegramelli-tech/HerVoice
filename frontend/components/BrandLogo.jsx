const HEART_COLOR = "#993556";
const VOICE_COLOR = "#2C2C2A";

const SIZES = {
  sm: {
    gap: "gap-3",
    icon: "h-5 w-5",
    text: "text-lg",
  },
  lg: {
    gap: "gap-4",
    icon: "h-8 w-8",
    text: "text-3xl sm:text-4xl",
  },
};

export default function BrandLogo({
  size = "sm",
  className = "",
  textClassName = "",
}) {
  const selectedSize = SIZES[size] || SIZES.sm;

  return (
    <div
      className={`inline-flex items-center ${selectedSize.gap} ${className}`.trim()}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={selectedSize.icon}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 20.2s-6.95-4.32-8.97-8.44C1.6 8.84 3.12 5.5 6.3 4.63c2.04-.56 4.14.18 5.7 1.98 1.56-1.8 3.66-2.54 5.7-1.98 3.18.87 4.7 4.21 3.27 7.13C18.95 15.88 12 20.2 12 20.2Z"
          fill={HEART_COLOR}
          fillOpacity="0.15"
          stroke={HEART_COLOR}
          strokeWidth="1.5"
        />
        <path
          d="M12 8.2v4.1M9.95 10.25h4.1"
          stroke={HEART_COLOR}
          strokeLinecap="round"
          strokeWidth="1.6"
        />
      </svg>

      <span
        className={`font-sans font-semibold tracking-tight ${selectedSize.text} ${textClassName}`.trim()}
      >
        <span style={{ color: HEART_COLOR }}>Her</span>
        <span style={{ color: VOICE_COLOR }}>Voice</span>
      </span>
    </div>
  );
}
