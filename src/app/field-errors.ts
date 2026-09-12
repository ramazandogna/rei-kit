/**
 * Anything that validates like a Zod schema.
 *
 * Structural rather than `z.ZodType`, and that is the point: the kit never
 * imports Zod, so an app that validates with something else — or with nothing —
 * does not download a validator to use a form. Zod satisfies this shape as it
 * is, so a consumer passes `signupSchema()` and nothing else changes.
 */
export type SafeParsable = {
  safeParse: (values: unknown) =>
    | { success: true }
    | {
        success: false
        error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] }
      }
}

/**
 * Field errors keyed by field name, or null when the values are valid.
 *
 * Zod's own error shape is a tree; a form needs one message per input, and
 * flattening it here keeps that reshaping out of every component that has a
 * form in it. The first issue per field wins — a field shows one message, and
 * the first is the one the reader can act on.
 *
 * Null rather than an empty object, so `if (errors)` is the guard and a caller
 * cannot accidentally treat "no errors" as a failure.
 *
 * @example
 * ```ts
 * const found = fieldErrors(signupSchema(), values)
 * if (found) return (errors.value = found)
 * ```
 */
export function fieldErrors(schema: SafeParsable, values: unknown): Record<string, string> | null {
  const result = schema.safeParse(values)
  if (result.success) return null

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '')
    if (field && !errors[field]) errors[field] = issue.message
  }

  // A schema can fail with every issue at the root -- a `refine` with no
  // `path`. Reporting "valid" there would let a broken submission through, so
  // the object is empty but present, and the caller still stops.
  return errors
}
