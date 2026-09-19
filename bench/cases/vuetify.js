// Each component imports its own stylesheet; the base styles are separate.
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { VTextField } from 'vuetify/components/VTextField'
import { VDialog } from 'vuetify/components/VDialog'
console.log(createVuetify, VBtn, VTextField, VDialog)
