/* Stands in for the app's own auth calls, so the examples that sign in
   type-check. With rei-kit/supabase these are one line each. */
export async function createAccount(email: string, password: string): Promise<void> {
  void email
  void password
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  void email
  void password
}

export function signInWithGoogle(): void {}
