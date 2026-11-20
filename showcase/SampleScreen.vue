<script setup lang="ts">
import { ref } from 'vue'

import {
  BaseAvatar,
  BaseBadge,
  BaseButton,
  BaseCard,
  BaseSwitch,
  ProgressBar,
  StatCard,
} from '../src/index'

/**
 * One composed screen of real kit parts. Shown inside a wrapper that carries
 * its own `data-material` and `data-palette`, so every surface, radius and
 * colour in it is re-skinned by the attribute alone.
 */
const reminder = ref(true)
</script>

<template>
  <BaseCard class="ss">
    <div class="ss-head">
      <BaseAvatar name="Aiko Tanaka" />
      <div>
        <p class="ss-hi">Good evening, Aiko</p>
        <p class="ss-sub">Day 21 of your streak</p>
      </div>
      <BaseBadge tone="success" class="ss-badge">On track</BaseBadge>
    </div>
    <div class="ss-stats">
      <StatCard value="¥48,200" label="This month" trend="up" />
      <StatCard value="21" label="Days" trend="flat" />
    </div>
    <div>
      <div class="ss-row"><span>JLPT N4</span><span>18 / 28</span></div>
      <ProgressBar :value="18" :max="28" label="JLPT progress" />
    </div>
    <BaseSwitch v-model="reminder" label="Daily reminder" />
    <div class="ss-actions">
      <BaseButton>Save</BaseButton>
      <BaseButton variant="secondary">Undo</BaseButton>
    </div>
  </BaseCard>
</template>

<style scoped>
.ss {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 26rem;
}
.ss-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ss-badge {
  margin-inline-start: auto;
}
.ss-hi {
  font-weight: 600;
}
.ss-sub {
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.ss-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.ss-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.ss-actions {
  display: flex;
  gap: 8px;
}
</style>
