import { useToast } from '../src/index'

const toast = useToast()

/**
 * Copies, and says so where the eye already is not: a toast.
 *
 * The button's own tick is easy to miss when the copy was the last thing on
 * the reader's mind before switching to the editor. A refusal — a browser
 * without clipboard permission — is said too, rather than failing silently
 * and leaving somebody pasting whatever was there before.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
    return true
  } catch {
    toast.warning('Could not copy — select the text and copy it instead')
    return false
  }
}
