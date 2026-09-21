// The documented on-demand path: each component's own style entry, which
// also pulls in the styles it depends on. Hand-listing theme-chalk files
// misses those, and misses them silently.
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/dialog/style/css'
import { ElButton, ElInput, ElDialog } from 'element-plus'
console.log(ElButton, ElInput, ElDialog)
