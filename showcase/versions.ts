/**
 * A peer range as a reader says it: `^3.5.0` is "3.5+", `^4.0.0` is "4.x".
 *
 * Read from package.json wherever the page states a version, so the page
 * cannot promise a range the package does not declare.
 */
export function readableRange(range: string): string {
  const [major, minor = '0'] = range.replace(/^[\^~>=\s]+/, '').split('.')

  return minor === '0' ? `${major}.x` : `${major}.${minor}+`
}
