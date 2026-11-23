import type { CSSProperties } from 'react';

/** Types inline styles that include CSS custom properties.
 * @param style - CSS declarations for a React element.
 * @returns The same style object.
 */
export function cssVariables(
  style: CSSProperties & Record<`--${string}`, string | number | undefined>,
): CSSProperties {
  return style;
}
