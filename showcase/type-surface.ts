/**
 * Every type the package exports, re-exported once.
 *
 * ## Why this file exists
 *
 * `public-api.spec.ts` names every *runtime* export of all six entries, and
 * a test cannot do the same for types: types are gone by the time a test
 * runs, and `src/__tests__/` is excluded from every tsconfig on purpose, so
 * a type imported there would be checked by nothing at all.
 *
 * This file is checked — it is part of the showcase, which `type-check:showcase`
 * and `type-check:strict` both cover. Remove or rename an exported type and
 * the import below stops resolving, which fails the build.
 *
 * It imports through the package's own entry specifiers rather than relative
 * paths, so it also proves those resolve the way a consumer writes them.
 *
 * `type-surface.spec.ts` reads the entry files and asserts every
 * `export type` reaches this list, so a type added without a guard fails
 * too. Nothing imports this file; it exists to be type-checked.
 */
export type {
  AppErrorKind,
  ColorSwatch,
  Column,
  ComboboxOption,
  DatePreset,
  DateRange,
  DayLabels,
  DescriptionItem,
  ErrorMapper,
  I18nRuntimeOptions,
  ListboxOption,
  LocalePreference,
  Material,
  Palette,
  PaletteName,
  PaletteRoles,
  PopoverTriggerProps,
  QueryValue,
  StepperStep,
  TabItem,
  ThemePreference,
  TimelineEvent,
  Toast,
  ToastAction,
  ToastOptions,
  ToastTone,
  Tone,
  VisualViewportRect,
  WeekStart,
} from 'rei-kit'

export type {
  AccordionItem,
  CommandGroup,
  CommandItem,
  Crumb,
  DataColumn,
  MegaMenuColumn,
  MegaMenuItem,
  MegaMenuLink,
  NavLinkItem,
  TableSort,
  TabPanel,
  TreeNode,
} from 'rei-kit/web'

export type {
  AuthFormLabels,
  AuthFormValues,
  AuthGuardOptions,
  QueryDefaultsOverrides,
  SafeParsable,
  SlideDirection,
  WriteReport,
  WriteReportMessages,
} from 'rei-kit/app'

/*
 * Through a relative path rather than `rei-kit/supabase`: the showcase never
 * imports that entry — it would pull in a database client for a page that
 * has none — so it has no alias for it. The types still have to be guarded.
 */
export type { AuthErrorCode, AuthMessageKeyOptions } from '../src/supabase/index'
