/**
 * The shapes `AuthForm` speaks in.
 *
 * Beside the component rather than inside it, because a `<script setup>` block
 * cannot export a type and a consumer typing its own labels object needs one.
 */

export type AuthFormValues = {
  email: string
  password: string
  /** Empty on sign-in; the form does not collect it there. */
  confirmPassword: string
}

/**
 * Every string `AuthForm` puts on screen.
 *
 * No defaults, in any language. A label the kit invented would ship English
 * into an app that has none, and it would do it silently — the form would look
 * finished and read wrong.
 */
export type AuthFormLabels = {
  email: string
  password: string
  confirmPassword: string
  /** The submit button. */
  submit: string
  /** The submit button while busy. Falls back to `submit`. */
  submitBusy?: string | undefined
  /** The Google button. Omitted, no Google button is rendered. */
  google?: string | undefined
  /** The word between the OAuth button and the form. Usually "or". */
  or?: string | undefined
  rememberMe?: string | undefined
  /** Under the password field on sign-up — the policy, stated before it is broken. */
  passwordHint?: string | undefined
  emailPlaceholder?: string | undefined
}
