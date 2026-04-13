export function Logo({ size = 20 }: { size?: number }) {
  const h = Math.round(size * (88 / 102));
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 102 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <path
        d="M65 14.5C65 22.5081 58.5081 29 50.5 29C42.4919 29 36 22.5081 36 14.5C36 6.49187 42.4919 0 50.5 0C58.5081 0 65 6.49187 65 14.5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M95 38H7V28H95V38Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M47.818 27.818C49.5754 26.0607 52.4246 26.0607 54.182 27.818L82.8198 56.4558C84.5772 58.2132 84.5772 61.0624 82.8198 62.8198C81.0624 64.5772 78.2132 64.5772 76.4558 62.8198L55.5 41.864L55.5 86L46.5 86L46.5 41.864L25.5441 62.8198C23.7868 64.5772 20.9375 64.5772 19.1802 62.8198C17.4228 61.0624 17.4228 58.2132 19.1802 56.4558L47.818 27.818Z"
        fill="currentColor"
      />
    </svg>
  );
}
