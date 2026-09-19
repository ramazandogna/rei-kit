<script setup lang="ts">
import { BaseAvatar, BaseMenu } from 'rei-kit'

function signOut() {
  // …
}
</script>

<template>
  <BaseMenu label="Account">
    <template #trigger>
      <BaseAvatar name="Aiko Tanaka" fallback="initials" />
    </template>

    <a href="/profile" role="menuitem">Profile</a>
    <button type="button" role="menuitem" @click="signOut">Sign out</button>
  </BaseMenu>
</template>
