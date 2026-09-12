<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import type { AuthFormLabels, AuthFormValues } from './auth-form'

import BaseAlert from '../components/BaseAlert.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseCheckbox from '../components/BaseCheckbox.vue'
import BaseInput from '../components/BaseInput.vue'
import GoogleButton from '../components/GoogleButton.vue'

/**
 * The sign-in and sign-up forms, which are one component.
 *
 * All three consumers had written this, and two of them had written it twice —
 * a login view and a signup view differing by one input and an autocomplete
 * hint. Two components that differ by one field drift apart: the kit's copies
 * had already diverged on the error colour, the placeholder and whether the
 * submit button changed its wording while busy.
 *
 * Keeping the two modes together also means moving between the routes replaces
 * a heading and adds an input, rather than tearing down a form and building
 * another one over the top of it.
 *
 * ## What it does not do
 *
 * It does not sign anybody in. It emits `submit` with the values and takes
 * `busy` and `error` back, because the store, the redirect and the wording of
 * a failure are the app's, and a form that reached for them would need to know
 * what the app is about. Validation is a function the caller passes for the
 * same reason: the password minimum is a product decision, and the kit has no
 * opinion on whether it is eight characters or ten.
 */
const {
  mode,
  labels,
  busy = false,
  error = '',
  validate,
} = defineProps<{
  mode: 'signIn' | 'signUp'
  /**
   * Every string on screen. No defaults, in any language: a label the kit
   * invented would ship English into an app that has none, and it would do
   * it silently.
   */
  labels: AuthFormLabels
  /** Disables the controls and spins the submit button. */
  busy?: boolean | undefined
  /**
   * A failure to show above the submit button, already translated.
   *
   * A sentence rather than a key, because the kit cannot translate and
   * `toAuthMessageKey` hands the caller a key precisely so the caller can.
   */
  error?: string | undefined
  /**
   * Returns one message per invalid field, or null when the values are good.
   *
   * Omitted, the form submits whatever is typed and lets the server decide —
   * which is a legitimate choice, not a broken one. `fieldErrors` turns a Zod
   * schema into this in one line.
   */
  validate?: ((values: AuthFormValues) => Record<string, string> | null) | undefined
}>()

const emit = defineEmits<{
  submit: [values: AuthFormValues]
  google: []
}>()

defineSlots<{
  /** Above everything — a heading and a line under it. */
  header?: () => unknown
  /** Replaces the Google button entirely, for a different provider or several. */
  oauth?: () => unknown
  /** Under the form — the link to the other mode, terms, anything. */
  foot?: () => unknown
}>()

const remember = defineModel<boolean>('remember', { default: true })

/**
 * Remember-me belongs on sign-in, and only where the app has words for it.
 *
 * A brand-new account has nothing to remember, so offering the choice on
 * sign-up is a question with one answer. Keyed off the label rather than a
 * `showRemember` flag because Vue casts an absent Boolean prop to `false`,
 * which makes "not passed" and "passed false" the same value — a flag that
 * cannot express its own default is worse than no flag.
 */
const wantsRemember = computed(() => mode === 'signIn' && Boolean(labels.rememberMe))

const values = reactive<AuthFormValues>({ email: '', password: '', confirmPassword: '' })
const errors = ref<Record<string, string>>({})

// Switching between the two modes keeps what has been typed — the email is the
// same email — but a stale error about the other form is a message about a
// field that is no longer on screen.
watch(
  () => mode,
  () => {
    errors.value = {}
  },
)

function submit() {
  // Sign-in has no confirm field, so whatever a mode switch left in it is not
  // part of this submission and must not be validated as if it were.
  const payload: AuthFormValues = {
    email: values.email,
    password: values.password,
    confirmPassword: mode === 'signUp' ? values.confirmPassword : '',
  }

  const found = validate?.(payload) ?? null
  errors.value = found ?? {}
  if (found) return

  emit('submit', payload)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <slot name="header" />

    <!-- OAuth first. Most people will use it, and burying it under a form they
         are not going to fill in is a form they have to look past. -->
    <slot name="oauth">
      <GoogleButton
        v-if="labels.google"
        :label="labels.google"
        :disabled="busy"
        @click="emit('google')"
      />
    </slot>

    <div v-if="labels.or" class="flex items-center gap-3">
      <span class="bg-hair h-px flex-1" />
      <span class="text-ink-soft text-xs">{{ labels.or }}</span>
      <span class="bg-hair h-px flex-1" />
    </div>

    <form novalidate class="flex flex-col gap-4" @submit.prevent="submit">
      <BaseInput
        v-model="values.email"
        type="email"
        :label="labels.email"
        :error="errors['email']"
        :placeholder="labels.emailPlaceholder"
        autocomplete="email"
      />

      <BaseInput
        v-model="values.password"
        type="password"
        :label="labels.password"
        :error="errors['password']"
        :hint="mode === 'signUp' ? labels.passwordHint : undefined"
        :autocomplete="mode === 'signUp' ? 'new-password' : 'current-password'"
      />

      <BaseInput
        v-if="mode === 'signUp'"
        v-model="values.confirmPassword"
        type="password"
        :label="labels.confirmPassword"
        :error="errors['confirmPassword']"
        autocomplete="new-password"
      />

      <BaseCheckbox
        v-if="wantsRemember"
        v-model="remember"
        size="sm"
        :label="labels.rememberMe ?? ''"
      />

      <!-- `assertive`, because it is the answer to something the reader just
           did and they cannot carry on without it. -->
      <BaseAlert v-if="error" tone="danger" assertive>{{ error }}</BaseAlert>

      <BaseButton type="submit" class="w-full" :loading="busy">
        {{ (busy && labels.submitBusy) || labels.submit }}
      </BaseButton>
    </form>

    <slot name="foot" />
  </div>
</template>
