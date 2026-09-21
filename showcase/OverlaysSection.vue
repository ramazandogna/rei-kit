<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { ref } from 'vue'

import {
  BaseAvatar,
  BaseButton,
  BaseCard,
  BaseMenu,
  BasePopconfirm,
  BasePopover,
  BaseSheet,
  BaseSwitch,
  SectionHeading,
  useToast,
} from '../src/index'
import { BaseDrawer, BaseModal, BaseTooltip, ResponsiveDialog } from '../src/web/index'
import { OVERLAY_PARTS } from './overlay-parts'
import type { OverlayPartId } from './overlay-parts'
import PropTable from './PropTable.vue'
import { NEUTRAL } from './tones'

/**
 * Everything that goes on top of the page, one at a time.
 *
 * The kit keeps these separate on purpose — merging them gives you one
 * component that is wrong everywhere — so the page keeps them separate too,
 * with a heading each rather than seven inside one card.
 */
const toast = useToast()

const modal = ref(false)
const alertModal = ref(false)
const sheet = ref(false)
const menuOpen = ref(false)
const askDelete = ref(false)
const onlyUnpaid = ref(true)
const thisMonth = ref(false)

const drawer = ref(false)
const drawerSide = ref<'start' | 'end' | 'top' | 'bottom'>('end')

function openDrawer(side: 'start' | 'end' | 'top' | 'bottom') {
  drawerSide.value = side
  drawer.value = true
}

const part = (id: OverlayPartId) => OVERLAY_PARTS.find((one) => one.id === id)!
</script>

<template>
  <section id="overlays">
    <SectionHeading :tone="NEUTRAL" label="Overlays" />
    <p class="text-ink-soft mt-2 max-w-[68ch] text-sm leading-relaxed">
      Several different answers to “put something on top of the page”, and the kit keeps them
      separate on purpose — merging them gives you one component that is wrong everywhere.
    </p>

    <!-- BaseModal -->
    <article :id="part('overlay-modal').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-modal').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-modal').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <p class="text-ink-soft mb-3 text-sm">
          Try the keyboard: focus moves inside, Tab cannot escape, Escape closes.
        </p>
        <div class="flex flex-wrap gap-3">
          <BaseButton @click="modal = true">Open modal</BaseButton>
          <BaseButton variant="secondary" @click="alertModal = true">
            Open a modal that must be answered
          </BaseButton>
        </div>

        <BaseModal v-model="modal" title="Delete this entry?" close-label="Close">
          Focus moved into this dialog when it opened, and it will return to the button you pressed
          when it closes. Tab cycles inside, Escape closes, and the page behind cannot scroll.
          <template #actions>
            <BaseButton variant="ghost" @click="modal = false">Cancel</BaseButton>
            <BaseButton @click="modal = false">Delete</BaseButton>
          </template>
        </BaseModal>

        <BaseModal
          v-model="alertModal"
          title="Your session has expired"
          close-label="Close"
          tone="alert"
          :dismissible="false"
        >
          With <code class="text-xs">dismissible: false</code> there is no close button and Escape
          does nothing — for a decision the reader has to actually make.
          <template #actions>
            <BaseButton @click="alertModal = false">Sign in again</BaseButton>
          </template>
        </BaseModal>
      </BaseCard>
      <PropTable name="BaseModal" />
    </article>

    <!-- BaseSheet -->
    <article :id="part('overlay-sheet').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-sheet').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-sheet').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <p class="text-ink-soft mb-3 max-w-[64ch] text-sm leading-relaxed">
          <strong class="text-ink">It will look narrow on a desktop, and that is correct.</strong>
          A sheet belongs to a phone-shaped app, so it is pinned to the same 430px column the app
          shell uses rather than stretching across a wide monitor.
        </p>
        <BaseButton variant="ghost" @click="sheet = true">Open bottom sheet</BaseButton>

        <BaseSheet
          v-model="sheet"
          title="New transaction"
          subtitle="This is what a sheet is for"
          close-label="Close"
        >
          <p class="text-ink-soft text-sm leading-relaxed">
            A form, a picker, a confirmation — anything a phone app would otherwise send you to a
            second screen for. It stops at the width of the app shell, which on a phone is the whole
            viewport.
          </p>
        </BaseSheet>
      </BaseCard>
      <PropTable name="BaseSheet" />
    </article>

    <!-- BaseDrawer -->
    <article :id="part('overlay-drawer').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-drawer').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-drawer').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <p class="text-ink-soft mb-3 text-sm">
          Try each edge: the panel keeps its contract, only the edge changes.
        </p>
        <div class="flex flex-wrap gap-2">
          <BaseButton
            v-for="edge in ['start', 'end', 'top', 'bottom'] as const"
            :key="edge"
            variant="secondary"
            size="sm"
            @click="openDrawer(edge)"
          >
            {{ edge }}
          </BaseButton>
        </div>

        <BaseDrawer v-model="drawer" :side="drawerSide" title="Filters" close-label="Close">
          <div class="flex flex-col gap-3">
            <BaseSwitch v-model="onlyUnpaid" label="Only unpaid" />
            <BaseSwitch v-model="thisMonth" label="This month" />
          </div>
          <template #actions>
            <BaseButton variant="ghost" @click="drawer = false">Clear</BaseButton>
            <BaseButton @click="drawer = false">Apply</BaseButton>
          </template>
        </BaseDrawer>
      </BaseCard>
      <PropTable name="BaseDrawer" />
    </article>

    <!-- BaseMenu -->
    <article :id="part('overlay-menu').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-menu').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-menu').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <BaseMenu v-model="menuOpen" label="Account">
          <template #trigger><BaseAvatar label="Account" /></template>
          <a role="menuitem" href="#api-BaseMenu">Profile</a>
          <a role="menuitem" href="#api-BaseAvatar">My notes</a>
          <hr />
          <button type="button" role="menuitem">Sign out</button>
        </BaseMenu>
      </BaseCard>
      <PropTable name="BaseMenu" />
    </article>

    <!-- BaseTooltip -->
    <article :id="part('overlay-tooltip').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-tooltip').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-tooltip').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <p class="text-ink-soft mb-3 text-sm">Reach the button with Tab and it appears.</p>
        <BaseTooltip label="Copy to clipboard">
          <template #default="{ describedBy }">
            <BaseButton variant="secondary" :aria-describedby="describedBy">
              <Settings class="size-4" />
            </BaseButton>
          </template>
        </BaseTooltip>

        <p class="text-ink-soft mt-5 mb-3 text-sm">
          With <code class="text-xs">follow</code>, for a target too big for a bubble pinned to its
          middle:
        </p>
        <BaseTooltip class="w-full" label="Tuesday, 12 September — 3 entries" follow>
          <template #default="{ describedBy }">
            <div
              class="bg-muted rounded-card text-ink-soft grid h-24 w-full place-items-center text-xs"
              tabindex="0"
              :aria-describedby="describedBy"
            >
              Move the pointer across this
            </div>
          </template>
        </BaseTooltip>
      </BaseCard>
      <PropTable name="BaseTooltip" />
    </article>

    <!-- BasePopover -->
    <article :id="part('overlay-popover').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-popover').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-popover').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <BasePopover label="Filters">
          <template #trigger="{ props }">
            <BaseButton variant="secondary" v-bind="props">Filters</BaseButton>
          </template>
          <template #default="{ close }">
            <div class="flex flex-col gap-3">
              <BaseSwitch v-model="onlyUnpaid" label="Only unpaid" />
              <BaseSwitch v-model="thisMonth" label="This month" />
              <BaseButton size="sm" block @click="close">Done</BaseButton>
            </div>
          </template>
        </BasePopover>
      </BaseCard>
      <PropTable name="BasePopover" />
    </article>

    <!-- BasePopconfirm -->
    <article :id="part('overlay-popconfirm').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-popconfirm').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-popconfirm').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <BasePopconfirm
          message="This entry will be deleted."
          confirm-label="Delete"
          cancel-label="Cancel"
          @confirm="toast.success('Entry deleted')"
        >
          <template #trigger="{ props }">
            <BaseButton variant="danger" size="sm" v-bind="props">Delete</BaseButton>
          </template>
        </BasePopconfirm>
      </BaseCard>
      <PropTable name="BasePopconfirm" />
    </article>

    <!-- ResponsiveDialog -->
    <article :id="part('overlay-responsive').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('overlay-responsive').title }}</h3>
        <p class="sc-part-pitch">{{ part('overlay-responsive').pitch }}</p>
      </header>

      <BaseCard class="mt-4">
        <p class="text-ink-soft mb-3 text-sm">Narrow the window and press it again.</p>
        <BaseButton variant="secondary" size="sm" @click="askDelete = true">
          Ask to delete
        </BaseButton>

        <ResponsiveDialog
          v-model="askDelete"
          title="Delete this account?"
          close-label="Close"
          tone="alert"
        >
          Everything in it goes with it. This cannot be undone.
          <template #actions>
            <BaseButton variant="secondary" @click="askDelete = false">Keep it</BaseButton>
            <BaseButton variant="danger" @click="askDelete = false">Delete</BaseButton>
          </template>
        </ResponsiveDialog>
      </BaseCard>
      <PropTable name="ResponsiveDialog" />
    </article>
  </section>
</template>
