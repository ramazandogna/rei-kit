<script setup lang="ts">
import { RouterLink } from 'vue-router'

import CodeBlock from './CodeBlock.vue'
import InstallCommand from './InstallCommand.vue'

const CSS = `@import 'tailwindcss';
@import 'rei-kit/tokens.css';
@import 'rei-kit/materials.css';
@import 'rei-kit/palettes.css';`

const TS = `<script setup lang="ts">
import { BaseButton, BaseCard } from 'rei-kit'
${'<'}/script>

<template>
  <BaseCard>
    <BaseButton>It works</BaseButton>
  </BaseCard>
</template>`
const JS = TS.replace(' lang="ts"', '')
</script>

<template>
  <section id="install" class="site-page site-section" aria-labelledby="install-h">
    <p class="site-eyebrow">Install</p>
    <h2 id="install-h" class="site-h2">Three steps.</h2>

    <ol class="is-steps">
      <li>
        <h3 class="site-h3">Install</h3>
        <InstallCommand kind="add" args="rei-kit" />
      </li>
      <li>
        <h3 class="site-h3">Import the styles</h3>
        <CodeBlock :code="CSS" lang="css" file="main.css" />
      </li>
      <li>
        <h3 class="site-h3">Use a component</h3>
        <CodeBlock :code="TS" :js="JS" file="App.vue" />
      </li>
    </ol>

    <RouterLink to="/docs/install" class="is-link">Full guide →</RouterLink>
  </section>
</template>

<style scoped>
.is-steps {
  display: grid;
  gap: 32px;
  margin-top: 32px;
  list-style: none;
  padding: 0;
}
@media (min-width: 64rem) {
  .is-steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.is-steps li {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}
.is-steps h3 {
  font-size: var(--site-text-lg);
}
.is-link {
  display: inline-block;
  margin-top: 32px;
  color: var(--color-primary);
  font-weight: 600;
}
</style>
