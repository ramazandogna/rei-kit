/** Replaced by `define` in both vite configs; see `VERSION` in `index.ts`. */
declare const __REI_KIT_VERSION__: string | undefined

/**
 * The consumer's build-time environment, narrowed to what the kit reads.
 *
 * Declared here rather than pulled in with `vite/client`, which would also
 * declare modules for every asset type and make the kit's types depend on a
 * bundler the consumer might not use. `SSR` is optional because the object is
 * substituted by whoever builds the app, and a runtime that substitutes
 * nothing must not turn a guard into a crash.
 */
interface ImportMeta {
  readonly env?: { readonly SSR?: boolean } | undefined
}
