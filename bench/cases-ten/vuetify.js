// Each component imports its own stylesheet; the base styles are separate.
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { VTextField } from 'vuetify/components/VTextField'
import { VDialog } from 'vuetify/components/VDialog'
import { VSelect } from 'vuetify/components/VSelect'
import { VCheckbox } from 'vuetify/components/VCheckbox'
import { VSwitch } from 'vuetify/components/VSwitch'
import { VTabs } from 'vuetify/components/VTabs'
import { VDataTable } from 'vuetify/components/VDataTable'
import { VTooltip } from 'vuetify/components/VTooltip'
import { VCard } from 'vuetify/components/VCard'
console.log(
  createVuetify, VBtn, VTextField, VDialog, VSelect,
  VCheckbox, VSwitch, VTabs, VDataTable, VTooltip, VCard,
)
