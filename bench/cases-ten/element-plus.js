// The documented on-demand path: each component's own style entry, which
// also pulls in the styles it depends on. Hand-listing theme-chalk files
// misses those, and misses them silently.
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/switch/style/css'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/table/style/css'
import 'element-plus/es/components/tooltip/style/css'
import 'element-plus/es/components/card/style/css'
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElDialog,
  ElInput,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTabs,
  ElTooltip,
} from 'element-plus'
console.log(
  ElButton, ElCard, ElCheckbox, ElDialog, ElInput,
  ElSelect, ElSwitch, ElTable, ElTabs, ElTooltip,
)
