<script lang="ts">
import { ref } from 'vue'

/** The figure the hero counts up; shared by all four layers so they agree. */
export const prismAmount = ref(48200)
</script>

<script setup lang="ts">
import { BaseAvatar, BaseBadge, BaseButton, BaseCard, BaseSwitch, ProgressBar } from '../src/index'

/**
 * One card, shown four times by the Prism. Every material-sensitive value
 * comes from kit tokens, so each layer's `data-material` re-skins it. The
 * rows run the full width on purpose: every seam crosses a control, so each
 * strip shows the same button, tile and switch in its own material.
 */
const reminder = ref(true)
</script>

<template>
  <div class="pc-wrap">
    <BaseCard class="pc">
      <div class="pc-head">
        <BaseAvatar name="Aiko Tanaka" />
        <div>
          <p class="pc-hi">Good evening, Aiko</p>
          <p class="pc-sub">Day 21 of your streak</p>
        </div>
        <BaseBadge tone="success" class="ms-auto">21 days</BaseBadge>
      </div>

      <div class="pc-stat">
        <p class="pc-stat-label">Saved this month</p>
        <p class="pc-stat-value prism-num">¥{{ prismAmount.toLocaleString('en-US') }}</p>
      </div>

      <div class="pc-tiles">
        <div class="pc-tile surface"><b>21</b><span>Days</span></div>
        <div class="pc-tile surface"><b>312</b><span>Words</span></div>
        <div class="pc-tile surface"><b>94%</b><span>Recall</span></div>
      </div>

      <div>
        <div class="pc-row"><span>JLPT N4</span><span>18 / 28</span></div>
        <ProgressBar :value="18" :max="28" label="JLPT progress" />
      </div>

      <BaseSwitch v-model="reminder" label="Daily reminder" />

      <div class="pc-actions">
        <BaseButton class="pc-main">Save progress</BaseButton>
        <BaseButton variant="secondary">Undo</BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
