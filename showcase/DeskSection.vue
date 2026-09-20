<script setup lang="ts">
import { ref } from 'vue'

import { BaseButton, BaseCard, BaseSeparator, SectionHeading } from '../src/index'
import { BaseSplitter, BaseToolbar, BaseTree, TransferList } from '../src/web/index'
import { DESK_PARTS } from './desk-parts'
import type { DeskPartId } from './desk-parts'
import PropTable from './PropTable.vue'
import { NEUTRAL } from './tones'

/**
 * The shapes a wide screen is arranged with, one at a time.
 *
 * They were three in a single demo and a fourth below it, which meant two of
 * them had no prop table: one demo can only carry one.
 */
const split = ref(38)
const openFolders = ref(['src'])
const openFile = ref<string | undefined>('index')
const granted = ref<string[]>(['read'])

const FILES = [
  {
    key: 'src',
    label: 'src',
    children: [
      { key: 'index', label: 'index.ts' },
      {
        key: 'components',
        label: 'components',
        children: [
          { key: 'button', label: 'BaseButton.vue' },
          { key: 'card', label: 'BaseCard.vue' },
        ],
      },
    ],
  },
  { key: 'readme', label: 'README.md' },
]

const PERMISSIONS = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Administer' },
  { value: 'billing', label: 'Billing' },
]

const part = (id: DeskPartId) => DESK_PARTS.find((one) => one.id === id)!
</script>

<template>
  <section id="masa">
    <SectionHeading :tone="NEUTRAL" label="Desk layout" />
    <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
      The shapes a wide screen is arranged with. Each is a keyboard problem first — which is the
      half a hand-written version leaves out, because it is the half you cannot see.
    </p>

    <article :id="part('desk-toolbar').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('desk-toolbar').title }}</h3>
        <p class="sc-part-pitch">{{ part('desk-toolbar').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <BaseToolbar label="Files">
          <BaseButton size="sm" variant="ghost">New</BaseButton>
          <BaseButton size="sm" variant="ghost">Rename</BaseButton>
          <BaseSeparator orientation="vertical" spacing="sm" />
          <BaseButton size="sm" variant="ghost" disabled>Delete</BaseButton>
          <BaseButton size="sm" variant="ghost">Share</BaseButton>
        </BaseToolbar>
        <p class="text-ink-soft mt-3 text-xs">
          Tab into it and use the arrows: the disabled one is skipped, and the row wraps.
        </p>
      </BaseCard>
      <PropTable name="BaseToolbar" />
    </article>

    <article :id="part('desk-splitter').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('desk-splitter').title }}</h3>
        <p class="sc-part-pitch">{{ part('desk-splitter').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <div class="border-hair/70 rounded-card h-56 overflow-hidden border">
          <BaseSplitter v-model="split" label="Resize the file list" class="h-full">
            <template #start>
              <BaseTree
                v-model="openFile"
                v-model:expanded="openFolders"
                class="p-2"
                :nodes="FILES"
                label="Files"
              />
            </template>
            <template #end>
              <div class="text-ink-soft p-4 text-sm">
                <p class="text-ink font-medium">{{ openFile ?? 'Nothing chosen' }}</p>
                <p class="mt-2 text-xs">
                  Tab to the handle, then use the arrows. Home and End send it to its limits; Enter
                  puts it back where it started.
                </p>
              </div>
            </template>
          </BaseSplitter>
        </div>
      </BaseCard>
      <PropTable name="BaseSplitter" />
    </article>

    <article :id="part('desk-tree').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('desk-tree').title }}</h3>
        <p class="sc-part-pitch">{{ part('desk-tree').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <BaseTree
          v-model="openFile"
          v-model:expanded="openFolders"
          :nodes="FILES"
          label="Files, on their own"
        />
        <p class="text-ink-soft mt-3 text-xs">
          Chosen: <span class="text-ink">{{ openFile ?? 'nothing' }}</span> — the same two models as
          the pane above, so both stay in step.
        </p>
      </BaseCard>
      <PropTable name="BaseTree" />
    </article>

    <article :id="part('desk-transfer').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('desk-transfer').title }}</h3>
        <p class="sc-part-pitch">{{ part('desk-transfer').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <TransferList
          v-model="granted"
          :options="PERMISSIONS"
          available-label="Available"
          chosen-label="Granted"
          add-label="Grant the chosen permissions"
          remove-label="Take back the chosen permissions"
          height="10rem"
        />
      </BaseCard>
      <PropTable name="TransferList" />
    </article>
  </section>
</template>
