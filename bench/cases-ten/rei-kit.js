import 'virtual:rei-kit.css'
import { BaseButton, BaseCard, BaseCheckbox, BaseInput, BaseSelect, BaseSwitch } from 'rei-kit'
// `DataTable` rather than `BaseTable`: the other five bring a data grid —
// sorting, selection, a loading state — so the comparable part is the one
// that has those, not the one that draws rows. It is the heavier of the two.
import { BaseModal, BaseTabs, BaseTooltip, DataTable } from 'rei-kit/web'
console.log(
  BaseButton,
  BaseCard,
  BaseCheckbox,
  BaseInput,
  BaseSelect,
  BaseSwitch,
  DataTable,
  BaseModal,
  BaseTabs,
  BaseTooltip,
)
