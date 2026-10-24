/**
 * Rotating arc the dispensation screens show while a document is being read.
 *
 * @param props - Tailwind sizing and colour classes.
 * @returns An animated SVG spinner.
 */
export function PresensiSpinner(props: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`animate-spin ${props.className}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" />
    </svg>
  );
}
